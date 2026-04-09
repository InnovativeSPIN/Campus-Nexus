import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  Leave,
  Faculty,
  FacultyLeaveSchedule,
  LeaveNotification,
  TimetableMaster,
  TimetableOverlay,
} = models;

/**
 * @desc    Apply timetable alterations (create overlays)
 * @route   POST /api/v1/faculty/alteration/:leaveId/apply
 * @access  Private (Timetable Incharge / Department Admin)
 */
export const applyTimetableAlterations = asyncHandler(async (req, res, next) => {
  const { leaveId } = req.params;
  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  try {
    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Verify leave is ready for alteration
    if (leave.overall_status !== 'substitute_approved') {
      return next(new ErrorResponse(
        'Leave must be approved by substitute before applying alteration',
        400
      ));
    }

    // Use body periods if provided (allows incharge to tweak substitute faculty/subject per period)
    const periodsToApply = req.body.affected_periods || leave.affected_periods;

    // STEP 1: Create TimetableOverlay rows (one per affected period)
    const overlayCreated = [];
    for (const period of periodsToApply) {
      try {
        // Use either the tweaked substitute/subject from period, or default to the leave request's values
        const finalSubstituteId = period.requested_substitute_faculty_id || leave.substitute_faculty_id;
        const finalSubjectId = period.subject_id; // Usually same, but could be parameterised if needed

        const overlay = await TimetableOverlay.create({
          master_id: period.master_id,
          overlay_date: new Date(period.date),
          period_slot_id: period.period_slot_id,
          original_faculty_id: leave.applicantId,
          substitute_faculty_id: finalSubstituteId,
          original_subject_id: period.subject_id,
          substitute_subject_id: finalSubjectId,
          leave_request_id: leaveId,
          reason: `Leave: ${leave.leaveType} - ${leave.reason}`,
          created_by: facultyId,
          status: 'active',
        });
        overlayCreated.push(overlay);
      } catch (err) {
        console.error('Error creating overlay for period:', err.message);
        // Continue with other periods
      }
    }

    // STEP 2: Create FacultyLeaveSchedule
    await FacultyLeaveSchedule.create({
      faculty_id: leave.applicantId,
      leave_id: leaveId,
      from_date: leave.startDate,
      to_date: leave.endDate,
      is_active: true,
      reason: leave.reason,
    });

    // STEP 3: Create staff attendance records for each day
    const attendanceRecords = [];
    const currentDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    while (currentDate <= endDate) {
      attendanceRecords.push({
        faculty_id: leave.applicantId,
        department_id: departmentId,
        attendance_date: new Date(currentDate),
        day_status: 'on_leave',
        leave_request_id: leaveId,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (attendanceRecords.length > 0) {
      try {
        await sequelize.models.Attendance.bulkCreate(attendanceRecords, {
          updateOnDuplicate: ['day_status', 'leave_request_id'],
          ignoreDuplicates: false,
        });
      } catch (err) {
        console.error('Error creating attendance records:', err.message);
        // Continue anyway
      }
    }

    // STEP 4: Determine if executive admin approval is needed (>2 days)
    const needsExecutiveApproval = leave.totalDays > 2;

    let newStatus = 'timetable_approved';
    if (needsExecutiveApproval) {
      newStatus = 'executive_pending';
    } else {
      newStatus = 'approved';
    }

    // Update Leave status
    leave.overall_status = newStatus;
    leave.timetable_incharge_approval_status = 'approved';
    leave.timetable_incharge_id = facultyId;
    leave.timetable_incharge_approval_date = new Date();
    await leave.save();

    // STEP 5: Notify relevant parties based on approval status

    // Always notify department admin
    const deptAdmins = await Faculty.findAll({
      where: {
        department_id: departmentId,
        role_id: 7,
        status: 'active',
      },
      attributes: ['faculty_id'],
    });

    const inchargeFaculty = await Faculty.findByPk(facultyId, {
      attributes: ['Name'],
    });

    const applicantFaculty = await Faculty.findByPk(leave.applicantId, {
      attributes: ['Name'],
    });

    const substituteFA = await Faculty.findByPk(leave.substitute_faculty_id, {
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

    // Notify Department Admin
    for (const admin of deptAdmins) {
      await LeaveNotification.create({
        recipientId: admin.faculty_id,
        recipientType: 'faculty',
        departmentId,
        senderId: facultyId,
        senderName: inchargeFaculty.Name,
        leaveId: leaveId,
        type: 'alteration_applied',
        title: `Timetable Updated - Alteration Applied`,
        message: `Timetable incharge ${inchargeFaculty.Name} has applied alteration for ${applicantFaculty.Name}'s ${leave.leaveType} leave (${startStr} to ${endStr}). Substitute: ${substituteFA.Name}.`,
        isRead: false,
      });
    }

    // If needs executive approval, notify executive admin
    if (needsExecutiveApproval) {
      const executiveAdmins = await Faculty.findAll({
        where: {
          status: 'active',
          role_id: 3, // Executive admin role
        },
        attributes: ['faculty_id'],
      });

      for (const execAdmin of executiveAdmins) {
        await LeaveNotification.create({
          recipientId: execAdmin.faculty_id,
          recipientType: 'faculty',
          departmentId,
          senderId: facultyId,
          senderName: inchargeFaculty.Name,
          leaveId: leaveId,
          type: 'executive_approval_required',
          title: `Executive Approval Required - Multi-Day Leave`,
          message: `${applicantFaculty.Name} has applied for a ${leave.leaveType} leave of ${leave.totalDays} days (${startStr} to ${endStr}). This requires executive admin approval. Substitute: ${substituteFA.Name}.`,
          isRead: false,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: needsExecutiveApproval
        ? 'Timetable alterations applied. Pending executive admin approval for >2 day leave.'
        : 'Timetable alterations applied successfully. Leave approved.',
      data: {
        leaveId: leave.id,
        status: leave.overall_status,
        overlaysCreated: overlayCreated.length,
        needsExecutiveApproval,
      },
    });
  } catch (error) {
    console.error('[applyTimetableAlterations] Error:', error.message);
    return next(new ErrorResponse(`Error applying alterations: ${error.message}`, 500));
  }
});

/**
 * @desc    Get timetable incharge queue - alterations to apply
 * @route   GET /api/v1/faculty/alteration/apply-queue
 * @access  Private (Timetable Incharge)
 */
export const getTimetableApplyQueue = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;

  try {
    // Verify user is timetable incharge
    const faculty = await Faculty.findByPk(facultyId);
    if (!faculty.is_timetable_incharge) {
      // Allow only for demonstration; in production, enforce strictly
      console.warn('[getTimetableApplyQueue] User is not marked as timetable incharge');
    }

    const queue = await Leave.findAll({
      where: {
        overall_status: 'substitute_approved',
        substitute_approval_status: 'approved',
        [Op.or]: [
          { timetable_incharge_approval_status: null },
          { timetable_incharge_approval_status: 'pending' },
        ],
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
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: queue.length,
      data: queue,
    });
  } catch (error) {
    console.error('[getTimetableApplyQueue] Error:', error.message);
    return next(new ErrorResponse(`Error fetching queue: ${error.message}`, 500));
  }
});

/**
 * @desc    Revert a timetable alteration (delete overlay)
 * @route   DELETE /api/v1/faculty/alteration/:overlayId
 * @access  Private (Timetable Incharge / Department Admin)
 */
export const revertAlteration = asyncHandler(async (req, res, next) => {
  const { overlayId } = req.params;
  const facultyId = req.user.faculty_id;

  try {
    const overlay = await TimetableOverlay.findByPk(overlayId);

    if (!overlay) {
      return next(new ErrorResponse('Overlay not found', 404));
    }

    // Get associated leave
    const leave = await Leave.findByPk(overlay.leave_request_id);

    if (!leave) {
      return next(new ErrorResponse('Associated leave not found', 404));
    }

    // Delete overlay
    overlay.status = 'cancelled';
    await overlay.save();

    // If all overlays are cancelled, update leave status
    const activeOverlays = await TimetableOverlay.count({
      where: {
        leave_request_id: overlay.leave_request_id,
        status: 'active',
      },
    });

    if (activeOverlays === 0) {
      leave.overall_status = 'timetable_approved';
      leave.timetable_incharge_approval_status = null;
      await leave.save();
    }

    res.status(200).json({
      success: true,
      message: 'Alteration reverted successfully',
      data: {
        overlayId: overlay.id,
        status: overlay.status,
      },
    });
  } catch (error) {
    console.error('[revertAlteration] Error:', error.message);
    return next(new ErrorResponse(`Error reverting alteration: ${error.message}`, 500));
  }
});
