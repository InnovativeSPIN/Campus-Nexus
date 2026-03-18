import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';
import {
    notifyStudentLeaveEvent,
    notifyFacultyApprovalPending,
    notifyDeptAdminApprovalPending
} from '../notification.controller.js';
import {
    checkIfClassIncharge,
    checkIfDepartmentAdmin,
    getDepartmentAdminId
} from './studentLeaveApproval.controller.js';

// Models destructured inside functions to avoid circularity

// Helper: Get approvers for a class via timetable_master
const getTimetableApprovers = async (classId, departmentId) => {
    const { TimetableMaster, Faculty } = models;
    try {
        const timetable = await TimetableMaster.findOne({
            where: { class_id: classId, status: { [Op.in]: ['draft', 'active'] } },
            attributes: ['class_coordinator_id', 'asst_coordinator_id', 'hod_id']
        });

        // Fallback for HOD if not set in timetable
        let hod_id = timetable?.hod_id;
        if (!hod_id && departmentId) {
            const admin = await Faculty.findOne({
                where: { role_id: 7, department_id: departmentId },
                attributes: ['faculty_id']
            });
            hod_id = admin?.faculty_id || null;
        }

        return {
            class_coordinator_id: timetable?.class_coordinator_id || null,
            asst_coordinator_id: timetable?.asst_coordinator_id || null,
            hod_id: hod_id
        };
    } catch (error) {
        return { class_coordinator_id: null, asst_coordinator_id: null, hod_id: null };
    }
};

// @desc   Get all leave applications for logged-in student
// @route  GET /api/v1/student-leaves
// @access Private/Student
export const getMyLeaves = asyncHandler(async (req, res, next) => {
    const { StudentLeave, Faculty } = models;
    try {
        const studentId = req.user.id;

        const where = { studentId };
        if (req.query.status) where.overall_status = req.query.status;

        const leaves = await StudentLeave.findAll({
            where,
            include: [
                { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email'] },
                { model: Faculty, as: 'deptAdminApprover', attributes: ['Name', 'email'] }
            ],
            order: [['startDate', 'DESC']]
        });

        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (error) {
        console.error('[GET MY LEAVES] ERROR:', error);
        return next(new ErrorResponse(error.message, 500));
    }
});

// @desc   Get single leave application
// @route  GET /api/v1/student-leaves/:id
// @access Private/Student
export const getLeave = asyncHandler(async (req, res, next) => {
    const { StudentLeave, Faculty } = models;
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({
        where: { id: req.params.id, studentId },
        include: [
            { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email'] },
            { model: Faculty, as: 'deptAdminApprover', attributes: ['Name', 'email'] }
        ]
    });

    if (!leave) return next(new ErrorResponse('Leave application not found', 404));
    res.status(200).json({ success: true, data: leave });
});

// @desc   Apply for leave
// @route  POST /api/v1/student-leaves
// @access Private/Student
export const applyLeave = asyncHandler(async (req, res, next) => {
    const { Student, StudentLeave } = models;
    const studentId = req.user.id;

    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('\n[APPLY-LEAVE] START'.green.bold);
            console.log('[APPLY-LEAVE] headers:', req.header('content-type'));
            console.log('[APPLY-LEAVE] body:', JSON.stringify(req.body, null, 2));
            console.log('[APPLY-LEAVE] file (multer):', req.file ? `id: ${req.file.fieldname}, name: ${req.file.filename}` : 'NONE');
            console.log('[APPLY-LEAVE] files (fileupload):', req.files ? Object.keys(req.files) : 'NONE');
        }

        const student = await Student.findByPk(studentId);
        if (!student) {
            console.error('[APPLY-LEAVE] Student not found ID:', studentId);
            return next(new ErrorResponse('Student not found in database', 404));
        }

        const { leaveType, leaveSubType, startDate, endDate, totalDays, reason, recipient } = req.body;
        
        // Basic Validation
        if (!startDate || !endDate || !reason) {
            console.error('[APPLY-LEAVE] VALIDATION FAILED: Missing dates or reason');
            return next(new ErrorResponse('Please provide all required fields: startDate, endDate, and reason.', 400));
        }

        // Determine IDs based on recipient selection and system assignments
        const approvers = await getTimetableApprovers(student.classId || 0, student.departmentId);
        console.log('[APPLY-LEAVE] Timetable Approvers:', JSON.stringify(approvers, null, 2));

        // Map "Personal Leave" etc to clean ENUMs if needed
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
            assignedClassInchargeId = null; // Direct to HOD
        } else {
            assignedClassInchargeId = approvers.class_coordinator_id;
        }

        // Attachment Filename extraction
        let imageFilename = null;
        if (req.file) {
            imageFilename = req.file.filename;
        } else if (req.files && req.files.attachment) {
            imageFilename = `legacy_upload_${Date.now()}_${req.files.attachment.name}`;
            const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'students', imageFilename);
            await req.files.attachment.mv(uploadPath);
        } else {
            imageFilename = req.body.attachment || null;
        }

        console.log('[APPLY-LEAVE] Creating database record with leaveType:', finalLeaveType);
        const leave = await StudentLeave.create({
            studentId,
            classId: student.classId || null,
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
        console.log('[APPLY-LEAVE] SUCCESS. Application ID:', leave.id);

        // Notify student of submission
        try {
            await notifyStudentLeaveEvent('leave_submitted', {
                userId: studentId,
                entityId: leave.id,
                relatedData: { 
                    leaveType: leave.leaveType, 
                    leaveSubType: leave.leaveSubType, 
                    totalDays: leave.totalDays 
                }
            });
        } catch (nErr) {
            console.error('[APPLY LEAVE] Notification Failed (Student):', nErr.message);
        }

        // Notify the primary recipient
        try {
            const primaryApproverId = (recipient === 'HOD') ? approvers.hod_id : assignedClassInchargeId;
            if (primaryApproverId) {
                await notifyFacultyApprovalPending({
                    facultyId: primaryApproverId,
                    studentName: `${student.firstName} ${student.lastName}`,
                    leaveType: leave.leaveType,
                    totalDays: leave.totalDays,
                    entityId: leave.id
                });
            }
        } catch (nErr) {
            console.error('[APPLY LEAVE] Notification Failed (Approver):', nErr.message);
        }

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error('[APPLY LEAVE] FATAL ERROR:', error);
        return next(new ErrorResponse(error.message, 500));
    }
});

// @desc   Get leaves for class in-charge
// @route  GET /api/v1/student-leaves/class-incharge
// @access Private/Faculty
export const getClassInchargeLeaves = asyncHandler(async (req, res, next) => {
    // Get faculty ID from user
    const facultyId = req.user.faculty_id;

    if (!facultyId) {
        return next(new ErrorResponse('Faculty ID not found', 400));
    }

    // Check if faculty is class coordinator or assistant coordinator in an active timetable
    const timetable = await TimetableMaster.findOne({
        where: {
            status: { [Op.in]: ['draft', 'active'] },
            [Op.or]: [
                { class_coordinator_id: facultyId },
                { asst_coordinator_id: facultyId }
            ]
        },
        attributes: ['class_id']
    });

    if (!timetable) {
        return next(new ErrorResponse('User is not assigned as a class in-charge', 403));
    }

    const classId = timetable.class_id;
    const { status } = req.query;

    const where = { classId };
    if (status) where.class_incharge_approval_status = status;

    const leaves = await StudentLeave.findAll({
        where,
        include: [
            {
                model: Student,
                as: 'student',
                attributes: ['id', 'studentId', 'firstName', 'lastName', 'rollNumber']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves
    });
});


// @desc   Update leave application
// @route  PUT /api/v1/student-leaves/:id
// @access Private/Student
export const updateLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({ where: { id: req.params.id, studentId } });
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    if (leave.overall_status !== 'pending') {
        return next(new ErrorResponse('Cannot update leave that is already processed', 400));
    }

    // Prevent student from manually setting approval fields
    delete req.body.class_incharge_approval_status;
    delete req.body.class_incharge_id;
    delete req.body.class_incharge_remarks;
    delete req.body.class_incharge_approval_date;
    delete req.body.department_admin_approval_status;
    delete req.body.department_admin_id;
    delete req.body.department_admin_remarks;
    delete req.body.department_admin_approval_date;
    delete req.body.overall_status;
    delete req.body.studentId;

    await leave.update({ ...req.body, overall_status: 'pending' });
    res.status(200).json({ success: true, data: leave });
});

// @desc   Cancel leave application
// @route  DELETE /api/v1/student-leaves/:id
// @access Private/Student
export const cancelLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({ where: { id: req.params.id, studentId } });
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    if (leave.overall_status !== 'pending') {
        return next(new ErrorResponse('Cannot cancel leave that is already processed', 400));
    }

    await leave.update({ overall_status: 'cancelled' });
    res.status(200).json({ success: true, data: { message: 'Leave application cancelled' } });
});

// @desc   Approve / reject leave application (faculty/admin)
// @route  PUT /api/v1/student-leaves/:id/approval
// @access Private/Faculty/Admin
export const processLeaveApproval = asyncHandler(async (req, res, next) => {
    const { StudentLeave, Student, Faculty } = models;
    const { status, approvalRemarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return next(new ErrorResponse('status must be approved or rejected', 400));
    }

    const leave = await StudentLeave.findByPk(req.params.id);
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    // Determine the role and execute appropriate approval flow.
    // Approval requires both Class Incharge and Department Admin.
    const facultyId = req.user.faculty_id;

    // Class Incharge approval
    if (req.user.role === 'faculty') {
        const isClassIncharge = await checkIfClassIncharge(facultyId, leave.classId);
        if (!isClassIncharge) {
            return next(new ErrorResponse('You are not authorized to approve this leave. Only the assigned Class In-charge can do this.', 403));
        }

        leave.class_incharge_approval_status = status;
        leave.class_incharge_id = facultyId;
        leave.class_incharge_remarks = approvalRemarks || null;
        leave.class_incharge_approval_date = new Date();

        if (status === 'rejected') {
            leave.overall_status = 'rejected';
            // Notify student of rejection
            await notifyStudentLeaveEvent('leave_rejected', {
                userId: leave.studentId,
                entityId: leave.id,
                relatedData: {
                    leaveType: leave.leaveType,
                    remarks: approvalRemarks || 'Not specified'
                }
            });
        }

        // If class incharge approves, send notification to Dept Admin
        if (status === 'approved') {
            // Fetch class details to get department_id
            const classData = await models.Class.findByPk(leave.classId);
            const deptAdminId = await models.Faculty.findOne({
                where: { role_id: 7, department_id: classData.department_id },
                attributes: ['faculty_id']
            });

            // Notify student that Class Incharge approved
            const faculty = await Faculty.findOne({ where: { faculty_id: facultyId }, attributes: ['Name'] });
            await notifyStudentLeaveEvent('leave_approved_by_ci', {
                userId: leave.studentId,
                entityId: leave.id,
                relatedData: { 
                    leaveType: leave.leaveType,
                    approverName: faculty?.Name || 'Class Incharge'
                }
            });

            if (deptAdminId) {
                const student = await Student.findByPk(leave.studentId);
                await notifyDeptAdminApprovalPending({
                    facultyId: deptAdminId.faculty_id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    leaveType: leave.leaveType,
                    classInchargeName: faculty?.Name || 'Class Incharge',
                    entityId: leave.id
                });
            }
        }
    }

    // Department Admin approval
    if (req.user.role === 'department-admin') {
        const isDeptAdmin = await checkIfDepartmentAdmin(facultyId, req.user.department_id);
        if (!isDeptAdmin) {
            return next(new ErrorResponse('You are not authorized to approve this leave. Only the Department Admin can do this.', 403));
        }

        // Ensure class incharge approval is in place first
        if (leave.class_incharge_approval_status !== 'approved') {
            return next(new ErrorResponse('Leave must be approved by the Class Incharge before Department Admin approval.', 400));
        }

        leave.department_admin_approval_status = status;
        leave.department_admin_id = facultyId;
        leave.department_admin_remarks = approvalRemarks || null;
        leave.department_admin_approval_date = new Date();

        if (status === 'approved') {
            leave.overall_status = 'approved';
            // Notify student of final approval
            await notifyStudentLeaveEvent('leave_approved', {
                userId: leave.studentId,
                entityId: leave.id,
                relatedData: { leaveType: leave.leaveType }
            });
        } else if (status === 'rejected') {
            leave.overall_status = 'rejected';
            // Notify student of rejection
            await notifyStudentLeaveEvent('leave_rejected', {
                userId: leave.studentId,
                entityId: leave.id,
                relatedData: {
                    leaveType: leave.leaveType,
                    remarks: approvalRemarks || 'Not specified'
                }
            });
        }
    }

    await leave.save();

    res.status(200).json({ success: true, data: leave });
});

