import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  Faculty,
  FacultySubstitutes,
  LeaveNotification,
  TimetableMaster,
  Leave,
} = models;

// Helper to purge old orphaned MySQL tracking constraints if they exist
async function purgeOldConstraints() {
  const purgeItems = [
    { table: 'faculty_substitutes', fk: 'fk_fsub_leave' },
    { table: 'leave_notifications_v2', fk: 'fk_ln_request' },
    { table: 'leave_notifications_v2', fk: 'fk_In_request' }
  ];

  for (const item of purgeItems) {
    try {
      await FacultySubstitutes.sequelize.query(`ALTER TABLE ${item.table} DROP FOREIGN KEY ${item.fk}`);
      console.log(`Cleaned up orphaned constraint: ${item.fk}`);
    } catch(e) { /* Already dropped */ }
  }
}

// Helper to notify dept admin and timetable incharge (informational only — no action buttons)
async function notifyAdminAndIncharge(departmentId, senderId, senderName, title, message, leaveId = null, notifType = 'submitted') {
  try {
    if (!departmentId) {
      console.error('[notifyAdminAndIncharge] CRITICAL: departmentId is missing. Aborting to prevent system-wide broadcast.');
      return;
    }

    const timetableMasters = await TimetableMaster.findAll({
      where: { department_id: departmentId, status: 'active' },
      attributes: ['timetable_incharge_id'],
    });
    const inchargeIds = [...new Set(
      timetableMasters.map(m => m.timetable_incharge_id).filter(Boolean)
    )];

    const deptAdmins = await Faculty.findAll({
      where: { department_id: departmentId, role_id: 7, status: 'active' },
      attributes: ['faculty_id'],
    });

    const recipients = [
      ...inchargeIds.map(fid => ({ faculty_id: fid, type: 'incharge' })),
      ...deptAdmins.map(a => ({ faculty_id: a.faculty_id, type: 'admin' })),
    ];

    for (const r of recipients) {
      try {
        if (!r.faculty_id) continue;
        await LeaveNotification.create({
          recipient_id: r.faculty_id,
          recipient_type: 'faculty',
          departmentId: departmentId,
          senderId,
          senderName,
          leave_request_id: leaveId,
          notification_type: notifType, // 'submitted' by default — no action buttons shown
          title,
          message,
          is_read: false,
        });
      } catch (err) {
        console.warn('Notification failed for recipient:', r.faculty_id, err.message);
      }
    }
  } catch (err) {
    console.error('[notifyAdminAndIncharge] Error:', err.message);
  }
}

/**
 * @desc    Request alteration substitute for a single period (pre-leave planning)
 * @route   POST /api/v1/faculty/alteration-plan/request-period
 * @access  Private (Faculty)
 */
export const requestPeriodAlteration = asyncHandler(async (req, res, next) => {
  const {
    substitute_faculty_id,
    period, // { date, period_slot_id, period_label, subject_id, subject_name, class_id, class_name, room, master_id }
    startDate, // overall leave date range (for grouping)
    endDate,
  } = req.body;

  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  if (!substitute_faculty_id) {
    return next(new ErrorResponse('Please select a substitute faculty member.', 400));
  }
  if (!period || !period.date) {
    return next(new ErrorResponse('Incomplete period details received. Please try refreshing.', 400));
  }

  if (parseInt(substitute_faculty_id) === facultyId) {
    return next(new ErrorResponse('Cannot request yourself as substitute', 400));
  }

  // Cleanup old DB barriers if this is the first interaction
  await purgeOldConstraints();

  // Find ANY historical records for this period that aren't tied to a leave yet
  const oldRecords = await FacultySubstitutes.findAll({
    where: {
      faculty_id: facultyId,
      leave_id: null,
      start_date: period.date,
    },
  });

  let existing = null;
  for (const r of oldRecords) {
    try {
      const info = JSON.parse(r.reason);
      if (String(info.period_slot_id) === String(period.period_slot_id)) {
        existing = r;
        break;
      }
    } catch (e) {}
  }

  if (existing) {
    if (['pending', 'approved'].includes(existing.status)) {
      return next(new ErrorResponse(`A substitute has already been requested or confirmed for period ${period.period_label || period.period_slot_id} on this date.`, 400));
    }
    // If it was rejected or cancelled, we recycle the existing row to prevent orphans
    existing.substitute_faculty_id = parseInt(substitute_faculty_id);
    existing.status = 'pending';
    existing.approval_date = null;
    existing.reason = JSON.stringify({
      ...JSON.parse(existing.reason), // preserve any other meta
      substitute_name: null, // clear old rejection context
      rejection_reason: null,
    });
    await existing.save();
    
    // We treat this as the planRecord for the rest of the flow
    var planRecord = existing;
  } else {
    // Create a brand new record only if none exist for this slot
    planRecord = await FacultySubstitutes.create({
      faculty_id: facultyId,
      substitute_faculty_id: parseInt(substitute_faculty_id),
      start_date: period.date,
      end_date: period.date,
      reason: JSON.stringify({
        period_slot_id: period.period_slot_id,
        period_label: period.period_label,
        subject_id: period.subject_id,
        subject_name: period.subject_name,
        class_id: period.class_id,
        class_name: period.class_name,
        room: period.room,
        master_id: period.master_id,
        start_time: period.start_time,
        end_time: period.end_time,
        startDate,
        endDate,
      }),
      requested_by: facultyId,
      status: 'pending',
    });
  }

  // Notify ONLY the substitute faculty (no admin notification at request time)
  try {
    const applicant = await Faculty.findByPk(facultyId, { attributes: ['Name'] });
    const dateStr = new Date(period.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    await LeaveNotification.create({
      recipient_id: parseInt(substitute_faculty_id),
      recipient_type: 'faculty',
      departmentId,
      senderId: facultyId,
      senderName: applicant.Name,
      // Store the FacultySubstitutes record ID so the frontend calls the correct endpoint
      leave_request_id: planRecord.id,
      notification_type: 'reassignment_requested',
      title: `Period Alteration Request - ${dateStr}`,
      message: `${applicant.Name} has requested you to cover their ${period.period_label || 'period'} on ${dateStr}${period.subject_name ? ` (${period.subject_name})` : ''}${period.class_name ? ` for class ${period.class_name}` : ''}. Please accept or reject.`,
      is_read: false,
    });
  } catch (notifErr) {
    console.warn('Alteration Notification failed:', notifErr.message);
  }

  // Fetch the record with substitute info
  const result = await FacultySubstitutes.findByPk(planRecord.id, {
    include: [{ model: Faculty, as: 'substitute_faculty', attributes: ['faculty_id', 'Name', 'designation'] }],
  });

  res.status(201).json({ success: true, data: result });
});

/**
 * @desc    Get my alteration plan records for a date range
 * @route   GET /api/v1/faculty/alteration-plan/my-plan
 * @access  Private (Faculty)
 */
export const getMyAlterationPlan = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const facultyId = req.user.faculty_id;

  const where = {
    faculty_id: facultyId,
  };

  // If no date range is specified, we only want the "active drafts" (unsubmitted plan)
  if (!startDate || !endDate) {
    where.leave_id = null;
  }

  if (startDate && endDate) {
    const startObj = new Date(startDate);
    const endObj = new Date(`${endDate}T23:59:59.999Z`);
    
    // Ensure robust string format for MySQL date/datetime queries
    const startStr = startDate.includes('T') ? startDate : `${startDate} 00:00:00`;
    const endStr = endDate.includes('T') ? endDate : `${endDate} 23:59:59`;

    where.start_date = { [Op.between]: [startStr, endStr] };
  }

  const records = await FacultySubstitutes.findAll({
    where,
    include: [
      { model: Faculty, as: 'substitute_faculty', attributes: ['faculty_id', 'Name', 'designation', 'email'] },
    ],
    order: [['start_date', 'ASC']],
  });

  res.status(200).json({ success: true, count: records.length, data: records });
});

/**
 * @desc    Reassign a rejected period to a new substitute
 * @route   PATCH /api/v1/faculty/alteration-plan/:id/reassign
 * @access  Private (Faculty)
 */
export const reassignPeriodAlteration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { new_substitute_faculty_id } = req.body;
  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  if (!new_substitute_faculty_id) {
    return next(new ErrorResponse('Please provide new_substitute_faculty_id', 400));
  }

  const record = await FacultySubstitutes.findByPk(id, {
    include: [{ model: Faculty, as: 'substitute_faculty', attributes: ['faculty_id', 'Name'] }],
  });

  if (!record || record.faculty_id !== facultyId) {
    return next(new ErrorResponse('Record not found or not authorized', 404));
  }

  if (record.status !== 'rejected') {
    return next(new ErrorResponse('Only rejected requests can be reassigned', 400));
  }

  const oldSubName = record.substitute_faculty?.Name || 'Previous faculty';

  // Update to new substitute
  record.substitute_faculty_id = parseInt(new_substitute_faculty_id);
  record.status = 'pending';
  record.approved_by = null;
  record.approval_date = null;
  await record.save();

  // Notify new substitute
  const applicant = await Faculty.findByPk(facultyId, { attributes: ['Name'] });
  const periodInfo = JSON.parse(record.reason || '{}');
  const dateStr = new Date(record.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  await LeaveNotification.create({
    recipient_id: parseInt(new_substitute_faculty_id),
    recipient_type: 'faculty',
    departmentId,
    senderId: facultyId,
    senderName: applicant.Name,
    // Store the FacultySubstitutes record ID for correct endpoint routing
    leave_request_id: record.id,
    notification_type: 'reassignment_requested',
    title: `Period Alteration Request - ${dateStr}`,
    message: `${applicant.Name} has requested you to cover their ${periodInfo.period_label || 'period'} on ${dateStr}${periodInfo.subject_name ? ` (${periodInfo.subject_name})` : ''}. Please accept or reject.`,
    is_read: false,
  });

  const updated = await FacultySubstitutes.findByPk(id, {
    include: [{ model: Faculty, as: 'substitute_faculty', attributes: ['faculty_id', 'Name', 'designation'] }],
  });

  res.status(200).json({ success: true, data: updated });
});

/**
 * @desc    Get pending period alteration requests for the logged-in substitute faculty
 * @route   GET /api/v1/faculty/alteration-plan/my-requests
 * @access  Private (Faculty)
 */
export const getMyPeriodRequests = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;

  const records = await FacultySubstitutes.findAll({
    where: {
      substitute_faculty_id: facultyId,
      leave_id: null,
      status: 'pending',
    },
    include: [
      { model: Faculty, as: 'absent_faculty', attributes: ['faculty_id', 'Name', 'designation', 'email'] },
    ],
    order: [['start_date', 'ASC']],
  });

  res.status(200).json({ success: true, count: records.length, data: records });
});

/**
 * @desc    Accept a period alteration request
 * @route   PATCH /api/v1/faculty/alteration-plan/:id/accept
 * @access  Private (Faculty)
 */
export const acceptPeriodAlteration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const facultyId = req.user.faculty_id;

  const record = await FacultySubstitutes.findByPk(id, {
    // Include department_id to ensure we notify the Correct department
    include: [{ model: Faculty, as: 'absent_faculty', attributes: ['faculty_id', 'Name', 'department_id'] }],
  });

  if (!record) return next(new ErrorResponse('Request not found', 404));
  const departmentId = record.absent_faculty?.department_id;
  if (record.substitute_faculty_id !== facultyId) return next(new ErrorResponse('Not authorized', 403));
  if (record.status !== 'pending') return next(new ErrorResponse('Request is no longer pending', 400));

  record.status = 'approved';
  record.approved_by = facultyId;
  record.approval_date = new Date();
  await record.save();

  const substituteInfo = await Faculty.findByPk(facultyId, { attributes: ['Name'] });
  const periodInfo = JSON.parse(record.reason || '{}');
  const dateStr = new Date(record.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Notify original faculty
  await LeaveNotification.create({
    recipient_id: record.faculty_id,
    recipient_type: 'faculty',
    departmentId,
    senderId: facultyId,
    senderName: substituteInfo.Name,
    leave_request_id: null,
    notification_type: 'approved',
    title: `Period Covered — ${dateStr}`,
    message: `${substituteInfo.Name} has accepted to cover your ${periodInfo.period_label || 'period'} on ${dateStr}${periodInfo.subject_name ? ` (${periodInfo.subject_name})` : ''}.`,
    is_read: false,
  });

  // Notify admin and incharge
  await notifyAdminAndIncharge(
    departmentId, facultyId, substituteInfo.Name,
    `Alteration Accepted — ${dateStr}`,
    `${substituteInfo.Name} has confirmed to cover ${record.absent_faculty?.Name || 'a faculty'}'s ${periodInfo.period_label || 'period'} on ${dateStr}.`,
  );

  res.status(200).json({ success: true, message: 'Period accepted. Original faculty notified.' });
});

/**
 * @desc    Reject a period alteration request
 * @route   PATCH /api/v1/faculty/alteration-plan/:id/reject
 * @access  Private (Faculty)
 */
export const rejectPeriodAlteration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;
  const facultyId = req.user.faculty_id;

  const record = await FacultySubstitutes.findByPk(id, {
    include: [{ model: Faculty, as: 'absent_faculty', attributes: ['faculty_id', 'Name', 'department_id'] }],
  });

  if (!record) return next(new ErrorResponse('Request not found', 404));
  const departmentId = record.absent_faculty?.department_id;
  if (record.substitute_faculty_id !== facultyId) return next(new ErrorResponse('Not authorized', 403));
  if (record.status !== 'pending') return next(new ErrorResponse('Request is no longer pending', 400));

  // Store rejection reason inside the reason JSON
  const periodInfo = JSON.parse(record.reason || '{}');
  periodInfo.rejection_reason = rejection_reason || null;
  record.reason = JSON.stringify(periodInfo);
  record.status = 'rejected';
  record.approval_date = new Date();
  await record.save();

  const substituteInfo = await Faculty.findByPk(facultyId, { attributes: ['Name'] });
  const dateStr = new Date(record.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const reasonText = rejection_reason ? ` Reason: ${rejection_reason}.` : '';

  // Notify original faculty
  await LeaveNotification.create({
    recipient_id: record.faculty_id,
    recipient_type: 'faculty',
    departmentId,
    senderId: facultyId,
    senderName: substituteInfo.Name,
    leave_request_id: null,
    notification_type: 'rejected',
    title: `Period Request Rejected — ${dateStr}`,
    message: `${substituteInfo.Name} has rejected to cover your ${periodInfo.period_label || 'period'} on ${dateStr}.${reasonText} Please assign another substitute.`,
    is_read: false,
  });

  // Notify admin and incharge
  await notifyAdminAndIncharge(
    departmentId, facultyId, substituteInfo.Name,
    `Alteration Rejected — ${dateStr}`,
    `${substituteInfo.Name} rejected covering ${record.absent_faculty?.Name || 'a faculty'}'s ${periodInfo.period_label || 'period'} on ${dateStr}.${reasonText}`,
  );

  res.status(200).json({ success: true, message: 'Period rejected. Original faculty notified.' });
});

/**
 * @desc    Cancel a pending period alteration request (by original faculty)
 * @route   DELETE /api/v1/faculty/alteration-plan/:id/cancel
 * @access  Private (Faculty)
 */
export const cancelPeriodAlteration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const facultyId = req.user.faculty_id;

  const record = await FacultySubstitutes.findByPk(id);
  if (!record || record.faculty_id !== facultyId) {
    return next(new ErrorResponse('Not found or not authorized', 404));
  }

  if (record.status === 'approved' && record.leave_id) {
    return next(new ErrorResponse('Cannot cancel an approved request linked to a leave', 400));
  }

  await record.destroy();

  res.status(200).json({ success: true, message: 'Alteration request cancelled' });
});

/**
 * @desc    Submit leave using a confirmed alteration plan
 * @route   POST /api/v1/faculty/leave-request/submit-with-plan
 * @access  Private (Faculty)
 */
export const submitLeaveWithPlan = asyncHandler(async (req, res, next) => {
  const {
    leaveType,
    startDate,
    endDate,
    reason,
    plan_record_ids, // Array of FacultySubstitutes IDs (all must be approved)
  } = req.body;

  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  if (!leaveType || !startDate || !endDate || !reason) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  if (!plan_record_ids || !Array.isArray(plan_record_ids) || plan_record_ids.length === 0) {
    return next(new ErrorResponse('No alteration plan records provided', 400));
  }

  // Map acronyms to DB Enums
  const typeMap = { 'CL': 'Casual', 'OD': 'On-Duty', 'ML': 'Medical', 'EL': 'Earned' };
  const dbLeaveType = typeMap[leaveType] || leaveType;

  // Verify all plan records are approved and belong to this faculty
  const planRecords = await FacultySubstitutes.findAll({
    where: {
      id: { [Op.in]: plan_record_ids },
      faculty_id: facultyId,
      leave_id: null,
    },
    include: [
      { model: Faculty, as: 'substitute_faculty', attributes: ['faculty_id', 'Name'] },
    ],
  });

  if (planRecords.length !== plan_record_ids.length) {
    return next(new ErrorResponse('Some plan records are invalid or already linked to a leave', 400));
  }

  const notApproved = planRecords.filter(r => r.status !== 'approved');
  if (notApproved.length > 0) {
    return next(new ErrorResponse(`${notApproved.length} period(s) still pending substitute confirmation. All periods must be confirmed before submitting.`, 400));
  }

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Build affected_periods from plan records
  const affected_periods = planRecords.map(r => {
    const info = JSON.parse(r.reason || '{}');
    return {
      date: r.start_date,
      period_slot_id: info.period_slot_id,
      period_label: info.period_label,
      subject_id: info.subject_id,
      subject_name: info.subject_name,
      class_id: info.class_id,
      class_name: info.class_name,
      room: info.room,
      master_id: info.master_id,
      substitute_faculty_id: r.substitute_faculty_id,
      substitute_name: r.substitute_faculty?.Name,
    };
  });

  // Cleanup old DB barriers
  await purgeOldConstraints();

  // Create the Leave record
  let leave;
  try {
    leave = await Leave.create({
      applicantId: facultyId,
      departmentId: departmentId || null,
      leaveType: dbLeaveType,
      startDate: start, // Ensure these are Date objects just in case! Mongoose/Sequelize normally parses strings, but dates are safer.
      endDate: end,
      totalDays,
      reason,
      applicantType: 'faculty',
      affected_periods,
      substitute_faculty_id: planRecords[0].substitute_faculty_id, // primary substitute
      overall_status: 'substitute_approved', // already approved in planning phase
      substitute_approval_status: 'approved',
      admin_approval_status: 'pending', // Pending Department Admin Approval
      substitute_approval_date: new Date(),
    });
  } catch (err) {
    console.error("Leave.create CRASH:", err);
    return next(err);
  }

  // Link all plan records to this leave
  await FacultySubstitutes.update(
    { leave_id: leave.id },
    { where: { id: { [Op.in]: plan_record_ids } } }
  );

  // Notify admins and incharge about the formal leave submission
  const applicant = await Faculty.findByPk(facultyId, { attributes: ['Name'] });
  const startStr = start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // 1. Info Notification
  await notifyAdminAndIncharge(
    departmentId, facultyId, applicant.Name,
    `Leave Application Submitted — ${applicant.Name}`,
    `${applicant.Name} has formally submitted a ${leaveType} leave from ${startStr} to ${endStr} (${totalDays} day${totalDays > 1 ? 's' : ''}). All ${planRecords.length} class period${planRecords.length > 1 ? 's' : ''} have confirmed substitutes.`,
    leave.id,
    'leave_submitted'
  );

  // 2. Actionable Notification for Department Admins
  try {
    const deptAdmins = await Faculty.findAll({
      where: { department_id: departmentId, role_id: 7, status: 'active' },
      attributes: ['faculty_id'],
    });

    for (const admin of deptAdmins) {
      if (!admin.faculty_id) continue;
      await LeaveNotification.create({
        recipient_id: admin.faculty_id,
        recipient_type: 'faculty',
        departmentId: departmentId,
        senderId: facultyId,
        senderName: applicant.Name,
        leave_request_id: leave.id,
        notification_type: 'leave_approval_requested',
        title: `Action Required: Leave Approval`,
        message: `${applicant.Name} has requested you to approve their ${leaveType} leave from ${startStr} to ${endStr}.`,
        is_read: false,
      });
    }
  } catch (err) {
    console.error('Failed to send actionable notification to Dept Admin:', err.message);
  }

  res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully. Department admin has been notified.',
    data: { leaveId: leave.id, totalDays, periods: planRecords.length },
  });
});

/**
 * @desc    Clear all unsubmitted alteration records for the current faculty
 * @route   DELETE /api/v1/faculty/alteration-plan/abort-draft
 * @access  Private (Faculty)
 */
export const abortDraft = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;

  await FacultySubstitutes.destroy({
    where: {
      faculty_id: facultyId,
      leave_id: null
    }
  });

  res.status(200).json({ success: true, message: 'Draft cleared' });
});
