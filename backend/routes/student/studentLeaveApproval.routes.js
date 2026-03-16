import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import {
    submitLeaveApplication,
    classInchargeApproveLeave,
    deptAdminApproveLeave,
    getPendingLeavesForClassIncharge,
    getPendingLeavesForDeptAdmin,
    getMyLeaveApplications,
    getLeaveDetails,
    withdrawLeave,
    checkIfClassIncharge,
    checkIfDepartmentAdmin,
    getDepartmentAdminId
} from '../../controllers/student/studentLeaveApproval.controller.js';
import { 
    notifyStudentLeaveEvent, 
    notifyDeptAdminApprovalPending 
} from '../../controllers/notification.controller.js';

const { StudentLeave, Student, Class: ClassModel, Faculty, TimetableMaster } = models;

const router = express.Router();

// Student routes
router.post(
    '/submit',
    protect,
    authorize('student'),
    submitLeaveApplication
);

router.get(
    '/my-applications',
    protect,
    authorize('student'),
    getMyLeaveApplications
);

router.get(
    '/:id',
    protect,
    getLeaveDetails
);

router.delete(
    '/:id/withdraw',
    protect,
    authorize('student'),
    withdrawLeave
);

// Class Incharge approval routes
router.get(
    '/pending/class-incharge',
    protect,
    authorize('faculty', 'department-admin'),
    getPendingLeavesForClassIncharge
);

// New format: /approvals/:id/class-incharge/approved or /rejected
const classInchargeApprovalHandler = asyncHandler(async (req, res, next) => {
    const { id, action } = req.params;
    const { remarks } = req.body;
    const facultyId = req.user.faculty_id;
    
    if (!['approved', 'rejected'].includes(action)) {
        return next(new ErrorResponse('Invalid action', 400));
    }

    const leave = await StudentLeave.findByPk(id, {
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
    leave.class_incharge_approval_status = action;
    leave.class_incharge_id = facultyId;
    leave.class_incharge_remarks = remarks || null;
    leave.class_incharge_approval_date = new Date();

    if (action === 'rejected') {
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
    } else if (action === 'approved') {
        // Move to next level - Department Admin approval
        leave.department_admin_approval_status = 'pending';
        
        // Notify student that CI approved
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
        message: `Leave ${action} by class incharge`,
        data: leave
    });
});

router.patch(
    '/:id/class-incharge/:action',
    protect,
    authorize('faculty', 'department-admin'),
    classInchargeApprovalHandler
);

// Department Admin approval routes
router.get(
    '/pending/dept-admin',
    protect,
    authorize('department-admin'),
    getPendingLeavesForDeptAdmin
);

// New format: /approvals/:id/dept-admin/approved or /rejected
const deptAdminApprovalHandler = asyncHandler(async (req, res, next) => {
    const { id, action } = req.params;
    const { remarks } = req.body;
    const facultyId = req.user.faculty_id;

    if (!['approved', 'rejected'].includes(action)) {
        return next(new ErrorResponse('Invalid action', 400));
    }

    const leave = await StudentLeave.findByPk(id, {
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
    leave.department_admin_approval_status = action;
    leave.department_admin_id = facultyId;
    leave.department_admin_remarks = remarks || null;
    leave.department_admin_approval_date = new Date();

    if (action === 'approved') {
        leave.overall_status = 'approved';
        // Notify student of final approval
        await notifyStudentLeaveEvent('leave_approved', {
            userId: leave.studentId,
            entityId: leave.id,
            relatedData: { leaveType: leave.leaveType }
        });
    } else if (action === 'rejected') {
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
        message: `Leave ${action} by department admin`,
        data: leave
    });
});

router.patch(
    '/:id/dept-admin/:action',
    protect,
    authorize('department-admin'),
    deptAdminApprovalHandler
);

export default router;
