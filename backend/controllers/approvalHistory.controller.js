import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { models } from '../models/index.js';

const { StudentLeave, Student, Faculty, Class: ClassModel } = models;

/**
 * ==============================================================
 * APPROVAL AUDIT LOG / HISTORY
 * ==============================================================
 * Provides comprehensive history of all approval actions
 */

// @desc   Get complete approval history for a leave application
// @route  GET /api/v1/approval-history/:leaveId
// @access Private (Student/Faculty)
export const getApprovalHistory = asyncHandler(async (req, res, next) => {
    const leaveId = req.params.leaveId;
    const userId = req.user.id;
    const facultyId = req.user.faculty_id;

    const leave = await StudentLeave.findByPk(leaveId, {
        include: [
            { 
                model: Student, 
                as: 'student',
                attributes: ['Name', 'rollNo', 'email']
            },
            {
                model: Faculty,
                as: 'classInchargeApprover',
                attributes: ['Name', 'email', 'phone_number']
            },
            {
                model: Faculty,
                as: 'deptAdminApprover',
                attributes: ['Name', 'email', 'phone_number']
            }
        ]
    });

    if (!leave) {
        return next(new ErrorResponse('Leave application not found', 404));
    }

    // Authorization check: Only student or involved faculty can view
    if (leave.studentId !== userId && leave.class_incharge_id !== facultyId && leave.department_admin_id !== facultyId) {
        return next(new ErrorResponse('Unauthorized to view this history', 403));
    }

    // Build complete timeline
    const timeline = [
        {
            step: 1,
            stage: 'Application Submitted',
            actor: leave.student.Name,
            role: 'Student',
            timestamp: leave.created_at,
            status: 'completed',
            remarks: null
        }
    ];

    // Class Incharge step
    if (leave.class_incharge_approval_status !== 'pending') {
        timeline.push({
            step: 2,
            stage: 'Class Incharge Review',
            actor: leave.classInchargeApprover?.Name || 'Unknown',
            role: 'Class Incharge',
            timestamp: leave.class_incharge_approval_date,
            status: leave.class_incharge_approval_status,
            remarks: leave.class_incharge_remarks
        });
    } else {
        timeline.push({
            step: 2,
            stage: 'Class Incharge Review',
            actor: 'Pending',
            role: 'Class Incharge',
            timestamp: null,
            status: 'pending',
            remarks: null
        });
    }

    // Department Admin step
    if (leave.class_incharge_approval_status === 'approved') {
        if (leave.department_admin_approval_status !== 'pending') {
            timeline.push({
                step: 3,
                stage: 'Department Admin Approval',
                actor: leave.deptAdminApprover?.Name || 'Unknown',
                role: 'Department Admin',
                timestamp: leave.department_admin_approval_date,
                status: leave.department_admin_approval_status,
                remarks: leave.department_admin_remarks
            });
        } else {
            timeline.push({
                step: 3,
                stage: 'Department Admin Approval',
                actor: 'Pending',
                role: 'Department Admin',
                timestamp: null,
                status: 'pending',
                remarks: null
            });
        }
    }

    res.status(200).json({
        success: true,
        data: {
            leave: {
                id: leave.id,
                studentName: leave.student.Name,
                studentRollNo: leave.student.rollNo,
                leaveType: leave.leaveType,
                leaveSubType: leave.leaveSubType,
                startDate: leave.startDate,
                endDate: leave.endDate,
                totalDays: leave.totalDays,
                reason: leave.reason,
                overallStatus: leave.overall_status
            },
            timeline
        }
    });
});

// @desc   Get audit logs for all leaves in a department
// @route  GET /api/v1/approval-history/department/audit
// @access Private (Department Admin)
export const getDepartmentAuditLog = asyncHandler(async (req, res, next) => {
    const facultyId = req.user.faculty_id;
    const departmentId = req.user.department_id;

    // Verify faculty is department admin
    const admin = await Faculty.findOne({
        where: { faculty_id: facultyId, role_id: 7, department_id: departmentId }
    });

    if (!admin) {
        return next(new ErrorResponse('You are not a department admin', 403));
    }

    // Get all classes in department
    const classes = await ClassModel.findAll({
        where: { department_id: departmentId },
        attributes: ['id']
    });

    const classIds = classes.map(c => c.id);
    if (classIds.length === 0) {
        return res.status(200).json({ 
            success: true, 
            count: 0,
            data: [] 
        });
    }

    // Get all leaves (completed and pending)
    const leaves = await StudentLeave.findAll({
        where: { classId: classIds },
        include: [
            { 
                model: Student, 
                as: 'student',
                attributes: ['Name', 'rollNo']
            },
            {
                model: Faculty,
                as: 'classInchargeApprover',
                attributes: ['Name']
            }
        ],
        order: [['created_at', 'DESC']]
    });

    // Format as audit log
    const auditLog = leaves.map(leave => ({
        id: leave.id,
        studentName: leave.student.Name,
        studentRollNo: leave.student.rollNo,
        leaveType: leave.leaveType,
        totalDays: leave.totalDays,
        submittedAt: leave.created_at,
        overallStatus: leave.overall_status,
        classInchargeStatus: leave.class_incharge_approval_status,
        classInchargeName: leave.classInchargeApprover?.Name || 'Not assigned',
        deptAdminStatus: leave.department_admin_approval_status,
        approvedAt: leave.department_admin_approval_date
    }));

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: auditLog
    });
});
