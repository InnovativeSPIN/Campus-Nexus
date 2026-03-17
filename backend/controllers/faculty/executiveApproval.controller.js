import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const {
  Leave,
  Faculty,
  LeaveNotification,
} = models;

/**
 * @desc    Get pending leave approvals for executive admin (>2 day leaves)
 * @route   GET /api/v1/faculty/leave-approval/pending
 * @access  Private (Executive Admin)
 */
export const getPendingExecutiveApprovals = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;

  // Verify user is executive admin
  if (!['executiveadmin', 'superadmin', 'super-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Only executive admin can access this endpoint', 403));
  }

  try {
    const pendingApprovals = await Leave.findAll({
      where: {
        overall_status: 'executive_pending',
        executive_admin_approval_status: null,
        applicantType: 'faculty',
      },
      include: [
        {
          model: Faculty,
          as: 'applicant',
          attributes: ['faculty_id', 'Name', 'email', 'department_id'],
        },
        {
          model: Faculty,
          as: 'substituteFaculty',
          attributes: ['faculty_id', 'Name', 'email'],
        },
        {
          model: Faculty,
          as: 'timetableIncharge',
          attributes: ['faculty_id', 'Name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals,
    });
  } catch (error) {
    console.error('[getPendingExecutiveApprovals] Error:', error.message);
    return next(new ErrorResponse(`Error fetching pending approvals: ${error.message}`, 500));
  }
});

/**
 * @desc    Executive admin approves a leave (>2 days)
 * @route   PATCH /api/v1/faculty/leave-approval/:leaveId/approve
 * @access  Private (Executive Admin)
 */
export const approveLeaveExecutiveAdmin = asyncHandler(async (req, res, next) => {
  const { leaveId } = req.params;
  const facultyId = req.user.faculty_id;

  // Verify user is executive admin
  if (!['executiveadmin', 'superadmin', 'super-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Only executive admin can approve leaves', 403));
  }

  try {
    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Verify leave is pending executive approval
    if (leave.overall_status !== 'executive_pending') {
      return next(new ErrorResponse('This leave is not pending executive approval', 400));
    }

    // STEP 1: Update Leave
    leave.overall_status = 'approved';
    leave.executive_admin_approval_status = 'approved';
    leave.executive_admin_id = facultyId;
    leave.executive_admin_approval_date = new Date();
    await leave.save();

    // STEP 2: Notify original faculty
    const execAdminFaculty = await Faculty.findByPk(facultyId, {
      attributes: ['Name'],
    });

    const applicantFaculty = await Faculty.findByPk(leave.applicantId, {
      attributes: ['Name'],
    });

    const startStr = new Date(leave.startDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const endStr = new Date(leave.endDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    await LeaveNotification.create({
      recipientId: leave.applicantId,
      recipientType: 'faculty',
      departmentId: leave.departmentId,
      senderId: facultyId,
      senderName: execAdminFaculty.Name,
      leaveId: leaveId,
      type: 'executive_approved',
      title: `Leave Approved - Executive Admin`,
      message: `Your ${leave.leaveType} leave from ${startStr} to ${endStr} (${leave.totalDays} days) has been approved by executive admin.`,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: 'Leave approved successfully by executive admin.',
      data: {
        leaveId: leave.id,
        status: leave.overall_status,
      },
    });
  } catch (error) {
    console.error('[approveLeaveExecutiveAdmin] Error:', error.message);
    return next(new ErrorResponse(`Error approving leave: ${error.message}`, 500));
  }
});

/**
 * @desc    Executive admin rejects a leave (>2 days)
 * @route   PATCH /api/v1/faculty/leave-approval/:leaveId/reject
 * @access  Private (Executive Admin)
 */
export const rejectLeaveExecutiveAdmin = asyncHandler(async (req, res, next) => {
  const { leaveId } = req.params;
  const { rejection_reason } = req.body;
  const facultyId = req.user.faculty_id;

  // Verify user is executive admin
  if (!['executiveadmin', 'superadmin', 'super-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Only executive admin can reject leaves', 403));
  }

  if (!rejection_reason) {
    return next(new ErrorResponse('Please provide a rejection reason', 400));
  }

  try {
    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Verify leave is pending executive approval
    if (leave.overall_status !== 'executive_pending') {
      return next(new ErrorResponse('This leave is not pending executive approval', 400));
    }

    // STEP 1: Update Leave
    leave.overall_status = 'rejected';
    leave.executive_admin_approval_status = 'rejected';
    leave.executive_admin_id = facultyId;
    leave.executive_admin_approval_date = new Date();
    leave.executive_admin_rejection_reason = rejection_reason;
    await leave.save();

    // STEP 2: Notify original faculty with rejection reason
    const execAdminFaculty = await Faculty.findByPk(facultyId, {
      attributes: ['Name'],
    });

    const applicantFaculty = await Faculty.findByPk(leave.applicantId, {
      attributes: ['Name'],
    });

    const startStr = new Date(leave.startDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const endStr = new Date(leave.endDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    await LeaveNotification.create({
      recipientId: leave.applicantId,
      recipientType: 'faculty',
      departmentId: leave.departmentId,
      senderId: facultyId,
      senderName: execAdminFaculty.Name,
      leaveId: leaveId,
      type: 'executive_rejected',
      title: `Leave Rejected - Executive Admin`,
      message: `Your ${leave.leaveType} leave from ${startStr} to ${endStr} (${leave.totalDays} days) has been rejected by executive admin. Reason: ${rejection_reason}`,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: 'Leave rejected successfully by executive admin.',
      data: {
        leaveId: leave.id,
        status: leave.overall_status,
        rejectionReason: rejection_reason,
      },
    });
  } catch (error) {
    console.error('[rejectLeaveExecutiveAdmin] Error:', error.message);
    return next(new ErrorResponse(`Error rejecting leave: ${error.message}`, 500));
  }
});

/**
 * @desc    Get rejection reasons for a faculty's rejected leave
 * @route   GET /api/v1/faculty/leave-request/:leaveId/rejection-reasons
 * @access  Private (Faculty)
 */
export const getLeaveRejectionReasons = asyncHandler(async (req, res, next) => {
  const { leaveId } = req.params;
  const facultyId = req.user.faculty_id;

  try {
    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Authorization check - can only view own leaves
    if (leave.applicantId !== facultyId && !['superadmin', 'executiveadmin'].includes(req.user.role)) {
      return next(new ErrorResponse('Not authorized to view this leave', 403));
    }

    const rejectionReasons = {
      substitute_rejection: null,
      timetable_rejection: null,
      executive_rejection: null,
    };

    if (leave.overall_status === 'substitute_rejected' && leave.substitute_rejection_reason) {
      rejectionReasons.substitute_rejection = {
        reason: leave.substitute_rejection_reason,
        date: leave.substitute_approval_date,
      };
    }

    if (leave.overall_status === 'timetable_rejected' && leave.timetable_incharge_rejection_reason) {
      rejectionReasons.timetable_rejection = {
        reason: leave.timetable_incharge_rejection_reason,
        date: leave.timetable_incharge_approval_date,
      };
    }

    if (leave.overall_status === 'rejected' && leave.executive_admin_rejection_reason) {
      rejectionReasons.executive_rejection = {
        reason: leave.executive_admin_rejection_reason,
        date: leave.executive_admin_approval_date,
      };
    }

    res.status(200).json({
      success: true,
      leaveId: leave.id,
      overallStatus: leave.overall_status,
      rejectionReasons,
    });
  } catch (error) {
    console.error('[getLeaveRejectionReasons] Error:', error.message);
    return next(new ErrorResponse(`Error fetching rejection reasons: ${error.message}`, 500));
  }
});
