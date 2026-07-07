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

    // Use applicant's department for attendance and notifications
    let departmentId = req.user.department_id;
    const applicant = await Faculty.findByPk(leave.applicantId);
    if (applicant && applicant.department_id) {
      departmentId = applicant.department_id;
    }

    // Verify leave is ready for alteration
    if (leave.overall_status !== 'hod_approved') {
      return next(new ErrorResponse(
        'Leave must be approved by department admin before applying alteration',
        400
      ));
    }

    // STEP 1: Create TimetableOverlay rows (one per affected period)
    const overlayCreated = [];
    
    // Use affected_periods from request body, fallback to leave.affected_periods
    let periodsToApply = req.body.affected_periods;
    if (!periodsToApply) {
      periodsToApply = typeof leave.affected_periods === 'string'
        ? JSON.parse(leave.affected_periods)
        : (leave.affected_periods || []);
    } else if (typeof periodsToApply === 'string') {
      periodsToApply = JSON.parse(periodsToApply);
    }

    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    for (const periodData of periodsToApply) {
      if (!periodData || !periodData.period_slot_id || !periodData.master_id) continue;

      const { period_slot_id, master_id, original_subject_id, substitute_subject_id, substitute_faculty_id } = periodData;

      const master = await TimetableMaster.findByPk(master_id, { raw: true });
      const slot = await sequelize.models.TimetableSlot.findByPk(period_slot_id, { raw: true });
      
      const class_id = master ? master.class_id : null;
      const department_id = master ? master.department_id : null;
      
      const final_original_subject = original_subject_id || (slot ? slot.subject_id : null) || leave.subject_id || null;
      const final_substitute_subject = substitute_subject_id || final_original_subject;

      let loopDate = new Date(startDate);
      while (loopDate <= endDate) {
        const formattedDate = loopDate.toISOString().split('T')[0];
        try {
          const overlay = await TimetableOverlay.create({
            master_id: master_id,
            overlay_date: formattedDate,
            period_slot_id: period_slot_id,
            class_id: class_id,
            department_id: department_id,
            original_faculty_id: leave.applicantId,
            substitute_faculty_id: substitute_faculty_id || leave.substitute_faculty_id,
            original_subject_id: final_original_subject,
            substitute_subject_id: final_substitute_subject,
            leave_request_id: leaveId,
            reason: `Leave: ${leave.leaveType} - ${leave.reason}`,
            created_by: facultyId,
            status: 'active',
          });
          overlayCreated.push(overlay);
        } catch (err) {
          console.error('Error creating overlay for period:', err.message);
          // If already exists, we could ignore
        }
        loopDate.setDate(loopDate.getDate() + 1);
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
    const attendanceEndDate = new Date(leave.endDate);

    while (currentDate <= attendanceEndDate) {
      attendanceRecords.push({
        staff_id: leave.applicantId,
        department_id: departmentId,
        work_date: new Date(currentDate),
        attendance_status: 'On-Leave',
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (attendanceRecords.length > 0) {
      try {
        await sequelize.models.Attendance.bulkCreate(attendanceRecords, {
          updateOnDuplicate: ['attendance_status'],
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
    if (newStatus === 'approved') {
      leave.status = 'approved';
    }
    leave.timetable_incharge_approval_status = 'approved';
    leave.timetable_incharge_id = facultyId;
    leave.timetable_incharge_approval_date = new Date();
    await leave.save();

    // If fully approved, update leave balance
    if (newStatus === 'approved' && leave.applicantType === 'faculty') {
      try {
        const currentYear = new Date().getFullYear().toString();
        const typeMappingBackend = {
          'Medical': 'Medical Leave',
          'Casual': 'Casual Leave',
          'Earned': 'Earned Leave',
          'On-Duty': 'On Duty',
          'Personal': 'Personal Leave',
          'Maternity': 'Maternity Leave',
          'Comp-Off': 'Comp-Off'
        };
        const mappedType = typeMappingBackend[leave.leaveType] || leave.leaveType;
        const [updatedRows] = await sequelize.query(
          `UPDATE leave_balance_v2 
           SET total_used = total_used + :days,
               total_remaining = total_remaining - :days,
               updated_at = NOW()
           WHERE faculty_id = :facultyId 
             AND leave_type_id = (SELECT id FROM leave_types WHERE name = :leaveType LIMIT 1)
             AND academic_year = :year`,
          {
            replacements: {
              days: leave.totalDays,
              facultyId: leave.applicantId,
              leaveType: mappedType,
              year: currentYear
            }
          }
        );
        console.log(`[AlterationApply] Leave balance updated for faculty ${leave.applicantId}`);
      } catch (balErr) {
        console.error('[AlterationApply] Error updating leave balance:', balErr.message);
      }
    }

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
    const inchargeName = inchargeFaculty ? inchargeFaculty.Name : 'Timetable Incharge';
    const applicantName = applicantFaculty ? applicantFaculty.Name : 'Faculty';
    const substituteName = substituteFA ? substituteFA.Name : 'Substitute';

    for (const admin of deptAdmins) {
      await LeaveNotification.create({
        recipientId: admin.faculty_id,
        recipientType: 'faculty',
        departmentId,
        senderId: facultyId,
        senderName: inchargeName,
        leaveId: leaveId,
        type: 'alteration_applied',
        title: `Timetable Updated - Alteration Applied`,
        message: `Timetable incharge ${inchargeName} has applied alteration for ${applicantName}'s ${leave.leaveType} leave (${startStr} to ${endStr}). Substitute: ${substituteName}.`,
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
          senderName: inchargeName,
          leaveId: leaveId,
          type: 'executive_approval_required',
          title: `Executive Approval Required - Multi-Day Leave`,
          message: `${applicantName} has applied for a ${leave.leaveType} leave of ${leave.totalDays} days (${startStr} to ${endStr}). This requires executive admin approval. Substitute: ${substituteName}.`,
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
        overall_status: 'hod_approved',
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
    
    const enrichedQueue = await Promise.all(queue.map(async (leaveObj) => {
      const leave = leaveObj.get ? leaveObj.get({ plain: true }) : leaveObj;
      
      const subs = await sequelize.models.FacultySubstitutes.findAll({
        where: { leave_id: leave.id, status: 'approved' },
        raw: true,
      });

      const affectedPeriods = [];
      for (const sub of subs) {
        try {
          const reasonData = typeof sub.reason === 'string' ? JSON.parse(sub.reason) : sub.reason;
          if (reasonData && reasonData.period_slot_id) {
            affectedPeriods.push({
              date: sub.start_date,
              period_slot_id: reasonData.period_slot_id,
              subject_id: reasonData.original_subject_id || leave.subject_id || 0,
              master_id: reasonData.master_id,
              requested_substitute_faculty_id: sub.substitute_faculty_id,
              subject_name: reasonData.subject_name || '',
              class_name: reasonData.class_name || '',
            });
          }
        } catch { }
      }

      return {
        ...leave,
        affected_periods: affectedPeriods,
      };
    }));

    res.status(200).json({
      success: true,
      count: enrichedQueue.length,
      data: enrichedQueue,
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
