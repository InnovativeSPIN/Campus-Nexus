import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  Leave,
  Faculty,
  FacultySubstitutes,
  LeaveNotification,
  FacultyLeaveSchedule,
  TimetableMaster,
  Class: ClassModel,
  TimetableSlot,
  Subject,
  PeriodSlot,
} = models;

/**
 * @desc    Faculty submits a leave request with timetable alteration
 * @route   POST /api/v1/faculty/leave-request/submit
 * @access  Private (Faculty)
 */
export const submitLeaveRequest = asyncHandler(async (req, res, next) => {
  const {
    leaveType,
    startDate,
    endDate,
    reason,
    classId,
    affected_periods, // Array of {date, period_slot_id, subject_id, class_id, master_id, requested_substitute_faculty_id}
    substitute_faculty_id,
  } = req.body;

  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  // Validation
  if (!leaveType || !startDate || !endDate || !reason) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  if (!substitute_faculty_id) {
    return next(new ErrorResponse('Please select a substitute faculty', 400));
  }

  if (!affected_periods || !Array.isArray(affected_periods) || affected_periods.length === 0) {
    return next(new ErrorResponse('Please specify affected periods', 400));
  }

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  try {
    // STEP 1: Create Leave Request
    const leave = await Leave.create({
      applicantId: facultyId,
      departmentId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      applicantType: 'faculty',
      affected_periods: affected_periods, // Store JSON array
      substitute_faculty_id,
      overall_status: 'substitute_pending',
      substitute_approval_status: 'pending',
    });

    // STEP 2: Create FacultySubstitutes record (for tracking)
    await FacultySubstitutes.create({
      faculty_id: facultyId,
      substitute_faculty_id,
      start_date: startDate,
      end_date: endDate,
      reason,
      leave_id: leave.id,
      status: 'pending',
      requested_by: facultyId,
    });

    // STEP 3: Notify Substitute Faculty
    const applicantFaculty = await Faculty.findByPk(facultyId, {
      attributes: ['Name', 'email'],
    });

    const startStr = new Date(startDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const endStr = new Date(endDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    await LeaveNotification.create({
      recipientId: substitute_faculty_id,
      recipientType: 'faculty',
      departmentId,
      senderId: facultyId,
      senderName: applicantFaculty.Name,
      leaveId: leave.id,
      facultyName: applicantFaculty.Name,
      leaveType,
      startDate,
      endDate,
      type: 'alteration_requested',
      title: `Timetable Alteration Request from ${applicantFaculty.Name}`,
      message: `${applicantFaculty.Name} has requested you to substitute for their classes from ${startStr} to ${endStr} (${leaveType} leave). Please review and accept or reject the request.`,
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted. Waiting for substitute faculty approval.',
      data: {
        leaveId: leave.id,
        status: leave.overall_status,
        totalDays,
        substitute_faculty_id,
      },
    });
  } catch (error) {
    console.error('[submitLeaveRequest] Error:', error.message);
    return next(new ErrorResponse(`Error submitting leave: ${error.message}`, 500));
  }
});

/**
 * @desc    Get all leave requests for the logged-in faculty
 * @route   GET /api/v1/faculty/leave-request/my-applications
 * @access  Private (Faculty)
 */
export const getMyLeaveApplications = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;

  try {
    const leaves = await Leave.findAll({
      where: {
        applicantId: facultyId,
        applicantType: 'faculty',
      },
      include: [
        {
          model: Faculty,
          as: 'substituteFaculty',
          attributes: ['faculty_id', 'Name', 'email'],
        },
        {
          model: Faculty,
          as: 'timetableIncharge',
          attributes: ['faculty_id', 'Name', 'email'],
        },
        {
          model: Faculty,
          as: 'executiveAdmin',
          attributes: ['faculty_id', 'Name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error('[getMyLeaveApplications] Error:', error.message);
    return next(new ErrorResponse(`Error fetching applications: ${error.message}`, 500));
  }
});

/**
 * @desc    Get details of a specific leave request
 * @route   GET /api/v1/faculty/leave-request/:id
 * @access  Private (Faculty / Admin)
 */
export const getLeaveRequestDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const facultyId = req.user.faculty_id;

  try {
    const leave = await Leave.findByPk(id, {
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
          attributes: ['faculty_id', 'Name', 'email'],
        },
        {
          model: Faculty,
          as: 'executiveAdmin',
          attributes: ['faculty_id', 'Name', 'email'],
        },
        {
          model: models.FacultySubstitutes,
          as: 'substitutes',
          include: [
            {
              model: Faculty,
              as: 'absent_faculty',
              attributes: ['faculty_id', 'Name'],
            },
            {
              model: Faculty,
              as: 'substitute_faculty',
              attributes: ['faculty_id', 'Name'],
            },
          ],
        },
      ],
    });

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Authorization check - can view if requestor, substitute, or admin
    if (
      leave.applicantId !== facultyId &&
      leave.substitute_faculty_id !== facultyId &&
      !['superadmin', 'executiveadmin', 'department-admin'].includes(req.user.role)
    ) {
      return next(new ErrorResponse('Not authorized to view this leave request', 403));
    }

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error('[getLeaveRequestDetails] Error:', error.message);
    return next(new ErrorResponse(`Error fetching leave details: ${error.message}`, 500));
  }
});

/**
 * @desc    Withdraw a leave request (only if pending)
 * @route   DELETE /api/v1/faculty/leave-request/:id/withdraw
 * @access  Private (Faculty)
 */
export const withdrawLeaveRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const facultyId = req.user.faculty_id;

  try {
    const leave = await Leave.findByPk(id);

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Only the requestor can withdraw
    if (leave.applicantId !== facultyId) {
      return next(new ErrorResponse('Not authorized to withdraw this request', 403));
    }

    // Can only withdraw if still pending
    if (leave.overall_status !== 'pending' && leave.overall_status !== 'substitute_pending') {
      return next(new ErrorResponse('Can only withdraw pending leave requests', 400));
    }

    // Update status
    leave.overall_status = 'cancelled';
    await leave.save();

    // Notify substitute faculty
    if (leave.substitute_faculty_id) {
      const applicantFaculty = await Faculty.findByPk(facultyId, {
        attributes: ['Name'],
      });

      await LeaveNotification.create({
        recipientId: leave.substitute_faculty_id,
        recipientType: 'faculty',
        departmentId: leave.departmentId,
        senderId: facultyId,
        senderName: applicantFaculty.Name,
        leaveId: leave.id,
        facultyName: applicantFaculty.Name,
        type: 'alteration_cancelled',
        title: `Alteration Request Cancelled`,
        message: `${applicantFaculty.Name} has cancelled their leave request (${leave.leaveType} leave).`,
        isRead: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave request withdrawn successfully',
    });
  } catch (error) {
    console.error('[withdrawLeaveRequest] Error:', error.message);
    return next(new ErrorResponse(`Error withdrawing request: ${error.message}`, 500));
  }
});

/**
 * @desc    Get pending leave requests waiting for substitute approval
 * @route   GET /api/v1/faculty/alteration/pending/:facultyId
 * @access  Private (Faculty)
 */
export const getPendingAlterationRequests = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;
  const loggedInFacultyId = req.user.faculty_id;

  // Only the substitute faculty can view their pending requests
  if (parseInt(facultyId) !== loggedInFacultyId) {
    return next(new ErrorResponse('Not authorized to view these requests', 403));
  }

  try {
    const pendingRequests = await Leave.findAll({
      where: {
        substitute_faculty_id: loggedInFacultyId,
        overall_status: 'substitute_pending',
        substitute_approval_status: 'pending',
      },
      include: [
        {
          model: Faculty,
          as: 'applicant',
          attributes: ['faculty_id', 'Name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests,
    });
  } catch (error) {
    console.error('[getPendingAlterationRequests] Error:', error.message);
    return next(new ErrorResponse(`Error fetching pending requests: ${error.message}`, 500));
  }
});

/**
 * @desc    Get leave requests for timetable incharge to apply alterations
 * @route   GET /api/v1/faculty/alteration/incharge/:facultyId
 * @access  Private (Timetable Incharge)
 */
export const getPendingAlterationsForIncharge = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;
  const loggedInFacultyId = req.user.faculty_id;

  try {
    // Verify user is authorized (must be the timetable incharge or admin)
    const faculty = await Faculty.findByPk(loggedInFacultyId);
    if (!faculty.is_timetable_incharge && !['superadmin', 'executiveadmin', 'department-admin'].includes(req.user.role)) {
      return next(new ErrorResponse('Not authorized as timetable incharge', 403));
    }

    // Get leaves that are approved by substitute but pending timetable application
    const pendingAlterations = await Leave.findAll({
      where: {
        overall_status: 'substitute_approved',
        timetable_incharge_approval_status: {
          [Op.in]: [null, 'pending'],
        },
      },
      include: [
        {
          model: Faculty,
          as: 'applicant',
          attributes: ['faculty_id', 'Name', 'email'],
        },
        {
          model: Faculty,
          as: 'substituteFaculty',
          attributes: ['faculty_id', 'Name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: pendingAlterations.length,
      data: pendingAlterations,
    });
  } catch (error) {
    console.error('[getPendingAlterationsForIncharge] Error:', error.message);
    return next(new ErrorResponse(`Error fetching pending alterations: ${error.message}`, 500));
  }
});

/**
 * @desc    Get slot details for a specific date and period
 * @route   GET /api/v1/faculty/leave-request/slot-details
 * @access  Private (Faculty)
 */
export const getSlotDetails = asyncHandler(async (req, res, next) => {
  const { date, period_slot_id } = req.query;
  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  if (!date || !period_slot_id) {
    return next(new ErrorResponse('Please provide date and period_slot_id', 400));
  }

  try {
    // Convert date to day of week
    const dateObj = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

    // Get the active timetable for the faculty's department
    const activeTimetable = await TimetableMaster.findOne({
      where: {
        department_id: departmentId,
        status: 'active',
      },
      attributes: ['id', 'class_id', 'academic_year', 'semester'],
    });

    if (!activeTimetable) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active timetable found',
      });
    }

    // Get the slot details
    const slotDetails = await TimetableSlot.findOne({
      where: {
        timetable_id: activeTimetable.id,
        day: dayOfWeek,
        period_number: parseInt(period_slot_id),
        faculty_id: facultyId,
      },
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_code', 'subject_name'],
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'class_name', 'semester'],
        },
      ],
      attributes: ['id', 'timetable_id', 'day', 'period_number', 'start_time', 'end_time', 'subject_id', 'faculty_id', 'class_id', 'room', 'type'],
    });

    res.status(200).json({
      success: true,
      data: slotDetails ? {
        id: slotDetails.id,
        day: slotDetails.day,
        period_number: slotDetails.period_number,
        start_time: slotDetails.start_time,
        end_time: slotDetails.end_time,
        type: slotDetails.type,
        room: slotDetails.room,
        subject: slotDetails.subject ? {
          id: slotDetails.subject.id,
          code: slotDetails.subject.subject_code,
          name: slotDetails.subject.subject_name,
        } : null,
        class: slotDetails.class ? {
          id: slotDetails.class.id,
          name: slotDetails.class.class_name,
          semester: slotDetails.class.semester,
        } : null,
      } : null,
      message: slotDetails ? 'Slot details found' : 'No slot found for this day and period',
    });
  } catch (error) {
    console.error('[getSlotDetails] Error:', error.message);
    return next(new ErrorResponse(`Error fetching slot details: ${error.message}`, 500));
  }
});
