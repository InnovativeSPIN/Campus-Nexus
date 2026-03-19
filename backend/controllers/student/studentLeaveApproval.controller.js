import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';
import {
    notifyStudentLeaveEvent,
    notifyFacultyApprovalPending,
    notifyDeptAdminApprovalPending
} from '../notification.controller.js';
// Models destructured inside functions to avoid circularity

/**
 * ==============================================================
 * STUDENT LEAVE - MULTI-LEVEL APPROVAL WORKFLOW
 * ==============================================================
 * Flow: Student → Class Incharge → Department Admin → Approved
 */

// @desc   Student submits leave application
// @route  POST /api/v1/student-leaves/approvals/submit
// @access Private/Student
export const submitLeaveApplication = asyncHandler(async (req, res, next) => {
    const { Student, StudentLeave } = models;
    const studentId = req.user.id;

    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('\n[SUBMIT LEAVE APP] START'.blue.bold);
            console.log('[SUBMIT-APP] headers:', req.header('content-type'));
            console.log('[SUBMIT-APP] body:', JSON.stringify(req.body, null, 2));
            console.log('[SUBMIT-APP] file (multer):', req.file ? `id: ${req.file.fieldname}, name: ${req.file.filename}` : 'NONE');
            console.log('[SUBMIT-APP] files (fileupload):', req.files ? Object.keys(req.files) : 'NONE');
        }

        // Fetch student details to get classId
        const student = await Student.findByPk(studentId);
        if (!student) {
            console.error('[SUBMIT LEAVE APP] Student not found ID:', studentId);
            return next(new ErrorResponse('Student not found in database', 404));
        }

        const { leaveType, leaveSubType, startDate, endDate, totalDays, reason, recipient } = req.body;

        // Basic Validation
        if (!startDate || !endDate || !reason) {
            console.error('[SUBMIT-APP] VALIDATION FAILED: Missing dates or reason');
            return next(new ErrorResponse('Please provide all required fields: startDate, endDate, and reason.', 400));
        }

        const classId = student.classId;
        if (!classId && process.env.NODE_ENV === 'development') {
            console.warn('[SUBMIT-APP] WARNING: Student class not assigned in profile'.yellow);
        }

        // Determine IDs based on recipient selection and system assignments
        // Approvers lookup helper is used here
        const approvers = await getTimetableApprovers(classId || 0, student.departmentId);
        console.log('[SUBMIT-APP] Timetable Approvers:', JSON.stringify(approvers, null, 2));

        // Map "Personal Leave" etc to clean ENUMs if needed for the database
        let finalLeaveType = 'Casual';
        const allowedTypes = ['Medical', 'Casual', 'On-Duty', 'Special', 'Personal', 'Earned', 'Other'];
        
        const incomingType = (leaveType || 'Casual').toString().trim();
        const incomingSub = (leaveSubType || '').toString().trim();

        // 1. Try to find match in main leaveType
        let found = allowedTypes.find(t => incomingType.includes(t));
        if (!found && incomingSub) {
            // 2. Try to find match in subType
            found = allowedTypes.find(t => incomingSub.includes(t));
        }
        
        finalLeaveType = found || 'Casual';

        let assignedClassInchargeId = null;
        let assignedDeptAdminId = approvers.hod_id;

        if (recipient === 'Faculty Advisor') {
            assignedClassInchargeId = approvers.asst_coordinator_id || approvers.class_coordinator_id;
        } else if (recipient === 'HOD') {
            assignedClassInchargeId = null; // Direct to HOD - skips CI
        } else {
            assignedClassInchargeId = approvers.class_coordinator_id;
        }

        // Attachment Filename extraction
        let imageFilename = null;
        if (req.file) {
            imageFilename = req.file.filename;
        } else if (req.files && req.files.attachment) {
            imageFilename = `legacy_upload_${Date.now()}_${req.files.attachment.name}`;
            // Move it if express-fileupload actually caught it
            const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'students', imageFilename);
            await req.files.attachment.mv(uploadPath);
        } else {
            imageFilename = req.body.attachment || null;
        }

        console.log('[SUBMIT-APP] Creating database record with leaveType:', finalLeaveType);
        const leave = await StudentLeave.create({
            studentId,
            classId: classId || null,
            leaveType: finalLeaveType,
            leaveSubType: incomingSub || null,
            startDate,
            endDate,
            totalDays: parseFloat(totalDays) || 1,
            reason,
            attachment: imageFilename,
            submitted_to: recipient || 'Class Incharge',
            overall_status: 'pending',
            class_incharge_approval_status: (recipient === 'HOD') ? 'approved' : 'pending',
            department_admin_approval_status: 'pending',
            class_incharge_id: assignedClassInchargeId,
            department_admin_id: assignedDeptAdminId
        });
        console.log('[SUBMIT-APP] SUCCESS. Application ID:', leave.id);

        // Notify student of submission
        try {
            await notifyStudentLeaveEvent('leave_submitted', {
                userId: studentId,
                entityId: leave.id,
                relatedData: { leaveType: leave.leaveType, leaveSubType, totalDays }
            });
        } catch (nErr) { console.error('[SUBMIT-APP-NOTIFICATION] Student Error:', nErr.message); }

        // Notify the primary recipient (CI or HOD)
        try {
            const primaryId = (recipient === 'HOD') ? assignedDeptAdminId : assignedClassInchargeId;
            if (primaryId) {
                await notifyFacultyApprovalPending({
                    facultyId: primaryId,
                    studentName: `${student.firstName} ${student.lastName}`,
                    leaveType: leave.leaveType,
                    totalDays,
                    entityId: leave.id
                });
            }
        } catch (nErr) { console.error('[SUBMIT-APP-NOTIFICATION] Approver Error:', nErr.message); }

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: leave
        });
    } catch (error) {
        console.error('[SUBMIT-APP] FATAL ERROR:'.red.bold, error.message);
        console.error(error.stack);
        return next(new ErrorResponse(error.message, 500));
    }
});

// @desc   Get approvers for a class via timetable_master
const getTimetableApprovers = async (classId, departmentId) => {
    const { TimetableMaster } = models;
    try {
        const timetable = await TimetableMaster.findOne({
            where: { class_id: classId, status: { [Op.in]: ['draft', 'active'] } },
            attributes: ['class_coordinator_id', 'asst_coordinator_id', 'hod_id']
        });

        const hod_id = timetable?.hod_id || await getDepartmentAdminId(departmentId);

        return {
            class_coordinator_id: timetable?.class_coordinator_id || null,
            asst_coordinator_id: timetable?.asst_coordinator_id || null,
            hod_id: hod_id
        };
    } catch (error) {
        return { class_coordinator_id: null, asst_coordinator_id: null, hod_id: null };
    }
};

// @desc   Class Incharge approves/rejects student leave
// @route  PATCH /api/v1/student-leaves/:id/class-incharge-approval
// @access Private/Faculty (Class Incharge)
export const classInchargeApproveLeave = asyncHandler(async (req, res, next) => {
    const { approval_status, remarks } = req.body;
    const leaveId = req.params.id;
    const facultyId = req.user.faculty_id;

    if (!['approved', 'rejected'].includes(approval_status)) {
        return next(new ErrorResponse('Invalid approval status', 400));
    }

    const { StudentLeave, Student, Class: ClassModel } = models;
    // Verify faculty is class incharge
    const leave = await StudentLeave.findByPk(leaveId, {
        include: [{ model: Student, as: 'student', include: [{ model: ClassModel, as: 'class' }] }]
    });

    if (!leave) {
        return next(new ErrorResponse('Leave request not found', 404));
    }

    // Check if faculty is class incharge for this class
    const isClassIncharge = await checkIfClassIncharge(facultyId, leave.classId);
    if (!isClassIncharge) {
        return next(new ErrorResponse('You are not authorized to approve this leave', 403));
    }

    // Update leave with class incharge approval
    leave.class_incharge_approval_status = approval_status;
    leave.class_incharge_id = facultyId;
    leave.class_incharge_remarks = remarks || null;
    leave.class_incharge_approval_date = new Date();

    if (approval_status === 'rejected') {
        leave.overall_status = 'rejected';
        // Notify student of rejection
        await notifyStudentLeaveEvent('leave_rejected', {
            userId: leave.studentId,
            entityId: leave.id,
            relatedData: {
                leaveType: leave.leaveType,
                remarks: remarks || 'Not specified'
            }
        });
    } else if (approval_status === 'approved') {
        // Move to next level - Department Admin approval
        leave.department_admin_approval_status = 'pending';

        const { Faculty } = models;
        // Notify student
        const classInchargeData = await Faculty.findOne({
            where: { faculty_id: facultyId },
            attributes: ['Name']
        });
        await notifyStudentLeaveEvent('leave_approved_by_ci', {
            userId: leave.studentId,
            entityId: leave.id,
            relatedData: {
                leaveType: leave.leaveType,
                approverName: classInchargeData?.Name || 'Class Incharge'
            }
        });

        // Notify department admin and assign to them
        const deptAdminId = await getDepartmentAdminId(leave.student.class.department_id);
        if (deptAdminId) {
            leave.department_admin_id = deptAdminId;
            const studentData = await Student.findByPk(leave.studentId);
            await notifyDeptAdminApprovalPending({
                facultyId: deptAdminId,
                studentName: `${studentData?.firstName} ${studentData?.lastName}` || 'A student',
                leaveType: leave.leaveType,
                classInchargeName: classInchargeData?.Name || 'Class Incharge',
                entityId: leave.id
            });
        }
    }

    await leave.save();

    res.status(200).json({
        success: true,
        message: `Leave ${approval_status} by class incharge`,
        data: leave
    });
});

// @desc   Department Admin approves/rejects student leave
// @route  PATCH /api/v1/student-leaves/:id/dept-admin-approval
// @access Private/Faculty (Department Admin)
export const deptAdminApproveLeave = asyncHandler(async (req, res, next) => {
    const { StudentLeave, Student, Class: ClassModel } = models;
    const { approval_status, remarks } = req.body;
    const leaveId = req.params.id;
    const facultyId = req.user.faculty_id;

    if (!['approved', 'rejected'].includes(approval_status)) {
        return next(new ErrorResponse('Invalid approval status', 400));
    }

    const leave = await StudentLeave.findByPk(leaveId, {
        include: [{ model: Student, as: 'student', include: [{ model: ClassModel, as: 'class' }] }]
    });

    if (!leave) {
        return next(new ErrorResponse('Leave request not found', 404));
    }

    // Check if faculty is department admin
    const isDeptAdmin = await checkIfDepartmentAdmin(facultyId, leave.student.class.department_id);
    if (!isDeptAdmin) {
        return next(new ErrorResponse('You are not authorized to approve this leave', 403));
    }

    // Verify class incharge has already approved
    if (leave.class_incharge_approval_status !== 'approved') {
        return next(new ErrorResponse('This leave must be approved by class incharge first', 400));
    }

    // Update leave with department admin approval
    leave.department_admin_approval_status = approval_status;
    leave.department_admin_id = facultyId;
    leave.department_admin_remarks = remarks || null;
    leave.department_admin_approval_date = new Date();

    if (approval_status === 'approved') {
        leave.overall_status = 'approved';
        // Notify student of final approval
        await notifyStudentLeaveEvent('leave_approved', {
            userId: leave.studentId,
            entityId: leave.id,
            relatedData: { leaveType: leave.leaveType }
        });
    } else if (approval_status === 'rejected') {
        leave.overall_status = 'rejected';
        // Notify student of rejection
        await notifyStudentLeaveEvent('leave_rejected', {
            userId: leave.studentId,
            entityId: leave.id,
            relatedData: {
                leaveType: leave.leaveType,
                remarks: remarks || 'Not specified'
            }
        });
    }

    await leave.save();

    res.status(200).json({
        success: true,
        message: `Leave ${approval_status} by department admin`,
        data: leave
    });
});

// @desc   Get pending leaves for class incharge to approve
// @route  GET /api/v1/student-leaves/pending/class-incharge
// @access Private/Faculty (Class Incharge)
export const getPendingLeavesForClassIncharge = asyncHandler(async (req, res, next) => {
    const facultyId = req.user.faculty_id;

    const { StudentLeave, Student } = models;
    // Get pending leaves where this faculty is the assigned incharge
    const leaves = await StudentLeave.findAll({
        where: {
            class_incharge_id: facultyId,
            class_incharge_approval_status: 'pending'
        },
        include: [{ model: Student, as: 'student' }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves
    });
});

// @desc   Get pending leaves for department admin to approve
// @route  GET /api/v1/student-leaves/pending/dept-admin
// @access Private/Faculty (Department Admin)
export const getPendingLeavesForDeptAdmin = asyncHandler(async (req, res, next) => {
    const facultyId = req.user.faculty_id;

    const { StudentLeave, Student, Faculty } = models;
    // Get leaves pending department admin approval where this faculty is the assigned admin
    const leaves = await StudentLeave.findAll({
        where: {
            department_admin_id: facultyId,
            class_incharge_approval_status: 'approved',
            department_admin_approval_status: 'pending'
        },
        include: [
            { model: Student, as: 'student' },
            { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves
    });
});

// @desc   Get student's leave applications
// @route  GET /api/v1/student-leaves/my-applications
// @access Private/Student
export const getMyLeaveApplications = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const { StudentLeave, Student, Faculty } = models;
    const leaves = await StudentLeave.findAll({
        where: { studentId },
        include: [
            { model: Student, as: 'student' },
            { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email'] },
            { model: Faculty, as: 'deptAdminApprover', attributes: ['Name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves
    });
});

// @desc   Get leave application details
// @route  GET /api/v1/student-leaves/:id
// @access Private (Student/Faculty)
export const getLeaveDetails = asyncHandler(async (req, res, next) => {
    const leaveId = req.params.id;

    const { StudentLeave, Student, Faculty } = models;
    const leave = await StudentLeave.findByPk(leaveId, {
        include: [
            { model: Student, as: 'student' },
            { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email', 'phone_number'] },
            { model: Faculty, as: 'deptAdminApprover', attributes: ['Name', 'email', 'phone_number'] }
        ]
    });

    if (!leave) {
        return next(new ErrorResponse('Leave application not found', 404));
    }

    res.status(200).json({
        success: true,
        data: leave
    });
});

// @desc   Cancel/withdraw leave application (student only - if pending)
// @route  DELETE /api/v1/student-leaves/:id
// @access Private/Student
export const withdrawLeave = asyncHandler(async (req, res, next) => {
    const leaveId = req.params.id;
    const studentId = req.user.id;

    const { StudentLeave } = models;
    const leave = await StudentLeave.findByPk(leaveId);
    if (!leave) {
        return next(new ErrorResponse('Leave application not found', 404));
    }

    if (leave.studentId !== studentId) {
        return next(new ErrorResponse('Unauthorized', 403));
    }

    if (leave.overall_status !== 'pending') {
        return next(new ErrorResponse('Can only withdraw pending applications', 400));
    }

    leave.overall_status = 'cancelled';
    await leave.save();

    res.status(200).json({
        success: true,
        message: 'Leave application withdrawn',
        data: leave
    });
});

export const checkIfClassIncharge = async (facultyId, classId) => {
    const { TimetableMaster } = models;
    const timetable = await TimetableMaster.findOne({
        where: { class_coordinator_id: facultyId, class_id: classId }
    });
    return !!timetable;
};

export const checkIfDepartmentAdmin = async (facultyId, departmentId) => {
    const { Faculty } = models;
    const admin = await Faculty.findOne({
        where: { faculty_id: facultyId, role_id: 7, department_id: departmentId }
    });
    return !!admin;
};

// Helper: Get department admin ID for a department
export const getDepartmentAdminId = async (departmentId) => {
    const { Faculty } = models;
    const admin = await Faculty.findOne({
        where: { role_id: 7, department_id: departmentId },
        attributes: ['faculty_id']
    });
    return admin?.faculty_id || null;
};
