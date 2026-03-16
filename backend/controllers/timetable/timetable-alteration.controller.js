import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  Leave,
  FacultySubstitutes,
  TimetableOverlay,
  TimetableMaster,
  Faculty,
  Subject,
  LeaveNotification,
} = models;

/**
 * STEP 1: Faculty submits leave with alteration request
 * @desc    Create a leave request with affected periods and requested substitute
 * @route   POST /api/alteration/request
 * @access  Private - Faculty only
 */
export const submitAlterationRequest = asyncHandler(async (req, res, next) => {
  const {
    class_id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    reason,
    affected_periods, // Array of { date, period_slot_id, class_id, subject_id, master_id, requested_substitute_faculty_id }
    substitute_faculty_id,
  } = req.body;

  // Validate required fields
  if (!class_id || !leave_type_id || !start_date || !end_date || !affected_periods || affected_periods.length === 0) {
    return next(new ErrorResponse('Missing required fields', 400));
  }

  if (!substitute_faculty_id) {
    return next(new ErrorResponse('Substitute faculty ID is required', 400));
  }

  // Get applicant's department
  const applicant = await Faculty.findByPk(req.user.faculty_id || req.user.id);
  if (!applicant) {
    return next(new ErrorResponse('Faculty profile not found', 404));
  }

  // DB WRITE 1: Create leave request
  const leaveRequest = await Leave.create({
    applicant_id: req.user.faculty_id || req.user.id,
    department_id: applicant.department_id,
    class_id,
    leave_type: leave_type_id, // Assuming leave_type_id is the type string
    start_date: new Date(start_date),
    end_date: new Date(end_date),
    total_days,
    reason,
    affected_periods: JSON.stringify(affected_periods), // Store as JSON
    substitute_faculty_id,
    overall_status: 'pending',
    applicant_type: 'faculty',
  });

  // DB WRITE 2: Create faculty substitutes record
  const facultySubstitute = await FacultySubstitutes.create({
    faculty_id: req.user.faculty_id || req.user.id,
    substitute_faculty_id,
    start_date: new Date(start_date),
    end_date: new Date(end_date),
    reason,
    leave_id: leaveRequest.id,
    status: 'pending',
    requested_by: req.user.faculty_id || req.user.id,
  });

  // DB WRITE 3: Notify substitute faculty
  await LeaveNotification.create({
    leave_request_id: leaveRequest.id,
    recipient_type: 'faculty',
    recipient_id: substitute_faculty_id,
    notification_type: 'submitted',
    title: `Alteration Request from ${applicant.Name}`,
    message: `You have been requested to substitute for classes on ${start_date} to ${end_date}. Please accept or reject.`,
    is_read: false,
  });

  res.status(201).json({
    success: true,
    message: 'Alteration request submitted',
    data: {
      leave_request_id: leaveRequest.id,
      substitute_request_id: facultySubstitute.id,
    },
  });
});

/**
 * STEP 2a: Substitute faculty accepts the alteration request
 * @desc    Accept alteration request and notify timetable incharge
 * @route   PATCH /api/alteration/:substituteId/accept
 * @access  Private - Substitute faculty only
 */
export const acceptAlteration = asyncHandler(async (req, res, next) => {
  const { substituteId } = req.params;

  const facultySubstitute = await FacultySubstitutes.findByPk(substituteId, {
    include: [
      { model: Leave, as: 'leave_request' },
      { model: Faculty, as: 'absent_faculty' },
      { model: Faculty, as: 'substitute_faculty' },
    ],
  });

  if (!facultySubstitute) {
    return next(new ErrorResponse(`Substitute record not found with id ${substituteId}`, 404));
  }

  if (facultySubstitute.status !== 'pending') {
    return next(new ErrorResponse(`Can only accept pending requests`, 400));
  }

  // Update substitute record
  await facultySubstitute.update({
    status: 'approved',
    approved_by: req.user.faculty_id || req.user.id,
    approval_date: new Date(),
  });

  // Find timetable incharge
  const leaveRequest = facultySubstitute.leave_request;
  const timetableMaster = await TimetableMaster.findOne({
    where: {
      class_id: leaveRequest.class_id,
      status: 'active',
    },
  });

  if (timetableMaster && timetableMaster.timetable_incharge_id) {
    // DB WRITE: Notify timetable incharge
    await LeaveNotification.create({
      leave_request_id: leaveRequest.id,
      recipient_type: 'faculty',
      recipient_id: timetableMaster.timetable_incharge_id,
      notification_type: 'approved',
      title: `Alteration Accepted: ${facultySubstitute.substitute_faculty.Name} accepted substitute for ${facultySubstitute.absent_faculty.Name}`,
      message: `Please update the timetable to reflect this alteration for classes from ${leaveRequest.start_date} to ${leaveRequest.end_date}.`,
      is_read: false,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Alteration request accepted. Timetable incharge has been notified.',
    data: facultySubstitute,
  });
});

/**
 * STEP 2b: Substitute faculty rejects the alteration request
 * @desc    Reject alteration request and notify original faculty
 * @route   PATCH /api/alteration/:substituteId/reject
 * @access  Private - Substitute faculty only
 */
export const rejectAlteration = asyncHandler(async (req, res, next) => {
  const { substituteId } = req.params;
  const { rejection_reason } = req.body;

  const facultySubstitute = await FacultySubstitutes.findByPk(substituteId, {
    include: [
      { model: Leave, as: 'leave_request' },
      { model: Faculty, as: 'absent_faculty' },
      { model: Faculty, as: 'substitute_faculty' },
    ],
  });

  if (!facultySubstitute) {
    return next(new ErrorResponse(`Substitute record not found with id ${substituteId}`, 404));
  }

  if (facultySubstitute.status !== 'pending') {
    return next(new ErrorResponse('Can only reject pending requests', 400));
  }

  // Update substitute record
  await facultySubstitute.update({
    status: 'rejected',
  });

  const leaveRequest = facultySubstitute.leave_request;

  // Notify original faculty
  await LeaveNotification.create({
    leave_request_id: leaveRequest.id,
    recipient_type: 'faculty',
    recipient_id: leaveRequest.applicant_id,
    notification_type: 'rejected',
    title: `Alteration Rejected: ${facultySubstitute.substitute_faculty.Name} rejected your request`,
    message: `${facultySubstitute.substitute_faculty.Name} has rejected your substitution request for ${leaveRequest.start_date} to ${leaveRequest.end_date}. Please request another faculty.`,
    is_read: false,
  });

  res.status(200).json({
    success: true,
    message: 'Alteration request rejected. Original faculty has been notified.',
    data: facultySubstitute,
  });
});

/**
 * STEP 3: Timetable incharge applies the alteration (creates overlay)
 * @desc    Apply approved alteration by creating timetable overlay records
 * @route   POST /api/alteration/apply
 * @access  Private - Timetable Incharge only
 */
export const applyAlteration = asyncHandler(async (req, res, next) => {
  const {
    leave_request_id,
    substitute_faculty_id,
  } = req.body;

  const leaveRequest = await Leave.findByPk(leave_request_id, {
    include: [
      { model: models.FacultySubstitutes, as: 'faculty_substitutes' },
    ],
  });

  if (!leaveRequest) {
    return next(new ErrorResponse(`Leave request not found`, 404));
  }

  const affectedPeriods = JSON.parse(leaveRequest.affected_periods || '[]');
  if (affectedPeriods.length === 0) {
    return next(new ErrorResponse('No affected periods in leave request', 400));
  }

  // Create overlay for each affected period
  const createdOverlays = [];
  for (const period of affectedPeriods) {
    const overlay = await TimetableOverlay.create({
      master_id: period.master_id,
      overlay_date: new Date(period.date),
      period_slot_id: period.period_slot_id,
      original_faculty_id: leaveRequest.applicant_id,
      substitute_faculty_id: substitute_faculty_id || period.requested_substitute_faculty_id,
      original_subject_id: period.subject_id,
      substitute_subject_id: period.subject_id, // Usually same unless special case
      reason: `Leave: ${leaveRequest.leave_type} - ${leaveRequest.reason}`,
      leave_request_id: leaveRequest.id,
      created_by: req.user.faculty_id || req.user.id,
      status: 'active',
    });
    createdOverlays.push(overlay);
  }

  // Update leave request status
  await leaveRequest.update({
    overall_status: 'approved',
  });

  // Create faculty leave schedule record
  await models.FacultyLeaveSchedule.create({
    faculty_id: leaveRequest.applicant_id,
    leave_id: leaveRequest.id,
    from_date: new Date(leaveRequest.start_date),
    to_date: new Date(leaveRequest.end_date),
    is_active: true,
    reason: leaveRequest.reason,
  });

  // Mark attendance as on_leave
  const startDate = new Date(leaveRequest.start_date);
  const endDate = new Date(leaveRequest.end_date);
  const attendanceRecords = [];

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    attendanceRecords.push({
      faculty_id: leaveRequest.applicant_id,
      department_id: leaveRequest.department_id,
      attendance_date: new Date(date),
      day_status: 'on_leave',
      leave_request_id: leaveRequest.id,
    });
  }

  if (attendanceRecords.length > 0) {
    await models.Attendance.bulkCreate(attendanceRecords, {
      ignoreDuplicates: true,
    });
  }

  // Notify department admin
  const departmentAdmins = await Faculty.findAll({
    where: {
      department_id: leaveRequest.department_id,
      role_id: 7, // department-admin
    },
  });

  for (const admin of departmentAdmins) {
    const applicant = await Faculty.findByPk(leaveRequest.applicant_id);
    await LeaveNotification.create({
      leave_request_id: leaveRequest.id,
      recipient_type: 'faculty',
      recipient_id: admin.faculty_id,
      notification_type: 'approved',
      title: `Timetable Updated: ${applicant.Name} on leave`,
      message: `An alteration has been applied for ${applicant.Name} from ${leaveRequest.start_date} to ${leaveRequest.end_date}.`,
      is_read: false,
    });
  }

  res.status(201).json({
    success: true,
    message: `Alteration applied. ${createdOverlays.length} overlay records created.`,
    data: {
      overlays_created: createdOverlays.length,
      leave_status: 'approved',
    },
  });
});

/**
 * @desc    Get pending alteration requests for a faculty (substitute view)
 * @route   GET /api/alteration/pending/:facultyId
 * @access  Private
 */
export const getPendingAlteration = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;

  const pending = await FacultySubstitutes.findAll({
    where: {
      substitute_faculty_id: facultyId,
      status: 'pending',
    },
    include: [
      { model: Faculty, as: 'absent_faculty', attributes: ['faculty_id', 'Name', 'email'] },
      { model: Faculty, as: 'substitute_faculty', attributes: ['faculty_id', 'Name', 'email'] },
      {
        model: Leave,
        as: 'leave_request',
        attributes: ['id', 'start_date', 'end_date', 'reason', 'leave_type'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    count: pending.length,
    data: pending,
  });
});

/**
 * @desc    Get alterations pending approval for timetable incharge
 * @route   GET /api/alteration/incharge/:facultyId
 * @access  Private - Timetable Incharge only
 */
export const getAlterationsToApply = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;

  // Find approved substitutes where timetable incharge needs to apply
  const approved = await FacultySubstitutes.findAll({
    where: {
      status: 'approved',
    },
    include: [
      { model: Faculty, as: 'absent_faculty' },
      { model: Faculty, as: 'substitute_faculty' },
      {
        model: Leave,
        as: 'leave_request',
        where: {
          overall_status: 'pending', // Not yet applied
        },
      },
    ],
    order: [['approval_date', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count: approved.length,
    data: approved,
  });
});

/**
 * @desc    Revert an alteration (delete overlay)
 * @route   DELETE /api/alteration/overlay/:overlayId
 * @access  Private - Timetable Incharge or Department Admin
 */
export const revertAlteration = asyncHandler(async (req, res, next) => {
  const { overlayId } = req.params;

  const overlay = await TimetableOverlay.findByPk(overlayId);
  if (!overlay) {
    return next(new ErrorResponse(`Overlay not found with id ${overlayId}`, 404));
  }

  await overlay.update({
    status: 'cancelled',
  });

  res.status(200).json({
    success: true,
    message: 'Alteration reverted',
    data: overlay,
  });
});
