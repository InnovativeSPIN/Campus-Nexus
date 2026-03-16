import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';
import { 
    notifyStudentLeaveEvent, 
    notifyFacultyApprovalPending,
    notifyDeptAdminApprovalPending 
} from '../notification.controller.js';
const { StudentLeave, Student, Class: ClassModel, Faculty, TimetableMaster } = models;

/**
 * ==============================================================
 * STUDENT LEAVE - MULTI-LEVEL APPROVAL WORKFLOW
 * ==============================================================
 * Flow: Student → Class Incharge → Department Admin → Approved
 */

// @desc   Student submits leave application
// @route  POST /api/v1/student-leaves/submit
// @access Private/Student
export const submitLeaveApplication = asyncHandler(async (req, res, next) => {
    const { leaveType, leaveSubType, startDate, endDate, totalDays, reason, attachment } = req.body;
    const studentId = req.user.id;

    // Fetch student details to get classId
    const student = await Student.findByPk(studentId);
    if (!student) {
        return next(new ErrorResponse('Student not found', 404));
    }

    const classId = student.classId;
    if (!classId) {
        return next(new ErrorResponse('Student class not assigned', 400));
    }

    // Create leave application
    const leave = await StudentLeave.create({
        studentId,
        classId,
        leaveType,
        leaveSubType,
        startDate,
        endDate,
        totalDays,
        reason,
        attachment: attachment || null,
        overall_status: 'pending',
        class_incharge_approval_status: 'pending',
        department_admin_approval_status: 'pending'
    });

    // Notify student of submission
    await notifyStudentLeaveEvent('leave_submitted', {
        userId: studentId,
        entityId: leave.id,
        relatedData: { leaveType, leaveSubType, totalDays }
    });

    // Fetch class incharge and notify them
    const classIncharge = await getTimetableIncharge(classId);
    if (classIncharge) {
        const fetchedStudent = await Student.findByPk(studentId, {
            attributes: ['Name']
        });
        await notifyFacultyApprovalPending({
            facultyId: classIncharge,
            studentName: fetchedStudent?.Name || 'A student',
            leaveType,
            totalDays,
            entityId: leave.id
        });
    }

    res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        data: leave
    });
});

// @desc   Get class incharge for a class via timetable_master
const getTimetableIncharge = async (classId) => {
    try {
        const timetable = await TimetableMaster.findOne({
            where: { class_id: classId, status: { [Op.in]: ['draft', 'active'] } },
            attributes: ['class_coordinator_id']
        });
        return timetable?.class_coordinator_id || null;
    } catch (error) {
        return null;
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

        // Notify department admin
        const deptAdminId = await getDepartmentAdminId(leave.student.class.department_id);
        if (deptAdminId) {
            const studentData = await Student.findByPk(leave.studentId, {
                attributes: ['Name']
            });
            await notifyDeptAdminApprovalPending({
                facultyId: deptAdminId,
                studentName: studentData?.Name || 'A student',
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

    // Get all classes where this faculty is class coordinator
    const timetables = await TimetableMaster.findAll({
        where: { class_coordinator_id: facultyId },
        attributes: ['class_id']
    });

    const classIds = timetables.map(t => t.class_id);
    if (classIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    // Get pending leaves for these classes
    const leaves = await StudentLeave.findAll({
        where: {
            classId: { [Op.in]: classIds },
            class_incharge_approval_status: 'pending'
        },
        include: [{ model: Student, as: 'student' }],
        order: [['created_at', 'DESC']]
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
    const departmentId = req.user.department_id;

    // Find department admin
    const admin = await Faculty.findOne({
        where: { faculty_id: facultyId, role_id: 7, department_id: departmentId }
    });

    if (!admin) {
        return next(new ErrorResponse('You are not a department admin', 403));
    }

    // Get classes in this department
    const classes = await ClassModel.findAll({
        where: { department_id: departmentId },
        attributes: ['id']
    });

    const classIds = classes.map(c => c.id);
    if (classIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    // Get leaves pending department admin approval
    const leaves = await StudentLeave.findAll({
        where: {
            classId: { [Op.in]: classIds },
            class_incharge_approval_status: 'approved',
            department_admin_approval_status: 'pending'
        },
        include: [{ model: Student, as: 'student' }],
        order: [['created_at', 'DESC']]
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

    const leaves = await StudentLeave.findAll({
        where: { studentId },
        include: [
            { model: Student, as: 'student' },
            { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email'] },
            { model: Faculty, as: 'deptAdminApprover', attributes: ['Name', 'email'] }
        ],
        order: [['created_at', 'DESC']]
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

// Helper: Check if faculty is class incharge
export const checkIfClassIncharge = async (facultyId, classId) => {
    const timetable = await TimetableMaster.findOne({
        where: { class_coordinator_id: facultyId, class_id: classId }
    });
    return !!timetable;
};

// Helper: Check if faculty is department admin
export const checkIfDepartmentAdmin = async (facultyId, departmentId) => {
    const admin = await Faculty.findOne({
        where: { faculty_id: facultyId, role_id: 7, department_id: departmentId }
    });
    return !!admin;
};

// Helper: Get department admin ID for a department
export const getDepartmentAdminId = async (departmentId) => {
    const admin = await Faculty.findOne({
        where: { role_id: 7, department_id: departmentId },
        attributes: ['faculty_id']
    });
    return admin?.faculty_id || null;
};
