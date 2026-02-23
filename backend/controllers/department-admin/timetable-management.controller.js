import models from '../../models/index.js';
import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';

/**
 * Check if faculty is a timetable incharge for their department
 */
export const checkTimetableIncharge = asyncHandler(async (req, res, next) => {
  const { faculty_id, department_id } = req.user;

  const faculty = await models.Faculty.findOne({
    where: { id: faculty_id, department_id, is_timetable_incharge: true }
  });

  if (!faculty) {
    throw new ErrorResponse('Only timetable incharge can access this resource', 403);
  }

  next();
});

/**
 * Get all timetables for a department and year
 */
export const getTimetablesByDepartmentAndYear = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { year } = req.params;

  const timetables = await models.Timetable.findAll({
    where: { department_id, year },
    include: [
      {
        model: models.Department,
        attributes: ['id', 'name']
      },
      {
        model: models.TimetableSlot,
        include: [
          { model: models.Subject, attributes: ['id', 'name'] },
          { model: models.Class, attributes: ['id', 'name'] }
        ]
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: timetables
  });
});

/**
 * Create a new timetable for the department
 */
export const createTimetable = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { year, session_start, session_end, is_published } = req.body;

  // Validate required fields
  if (!year || !session_start || !session_end) {
    throw new ErrorResponse('Year, session start, and session end are required', 400);
  }

  // Check if timetable already exists for this department and year
  const existingTimetable = await models.Timetable.findOne({
    where: { department_id, year }
  });

  if (existingTimetable) {
    throw new ErrorResponse(`Timetable already exists for ${year} year`, 409);
  }

  const timetable = await models.Timetable.create({
    department_id,
    year,
    session_start,
    session_end,
    is_published: is_published || false
  });

  res.status(201).json({
    success: true,
    data: timetable
  });
});

/**
 * Update timetable
 */
export const updateTimetable = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { id } = req.params;
  const { year, session_start, session_end, is_published } = req.body;

  const timetable = await models.Timetable.findOne({
    where: { id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  // If trying to change year, check no duplicate exists
  if (year && year !== timetable.year) {
    const duplicate = await models.Timetable.findOne({
      where: { department_id, year }
    });
    if (duplicate) {
      throw new ErrorResponse(`Timetable already exists for ${year} year`, 409);
    }
  }

  await timetable.update({
    year: year || timetable.year,
    session_start: session_start || timetable.session_start,
    session_end: session_end || timetable.session_end,
    is_published: is_published !== undefined ? is_published : timetable.is_published
  });

  res.status(200).json({
    success: true,
    data: timetable
  });
});

/**
 * Assign faculty to a timetable slot
 * Validates: One faculty → One subject per class (per session)
 */
export const assignFacultyToSlot = asyncHandler(async (req, res, next) => {
  const { faculty_id: incharge_id, department_id } = req.user;
  const { timetable_id, class_id, subject_code, subject_name, faculty_id, day_of_week, start_time, end_time, room_number } = req.body;

  // Validate all required fields
  if (!timetable_id || !class_id || !subject_code || !subject_name || !faculty_id || !day_of_week || !start_time || !end_time) {
    throw new ErrorResponse('All required fields must be provided', 400);
  }

  // Verify timetable belongs to incharge's department
  const timetable = await models.Timetable.findOne({
    where: { id: timetable_id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  // Verify faculty belongs to same department
  const faculty = await models.Faculty.findOne({
    where: { faculty_id, department_id }
  });

  if (!faculty) {
    throw new ErrorResponse('Faculty not found in your department', 404);
  }

  // Check if faculty is already assigned to this subject in this class (for the entire timetable/session)
  const existingAssignment = await models.TimetableSlotAssignment.findOne({
    where: {
      timetable_id,
      class_id,
      subject_code,
      faculty_id,
      status: ['active', 'pending_approval']
    }
  });

  if (existingAssignment) {
    throw new ErrorResponse('Faculty is already assigned to this subject for this class', 409);
  }

  // Check for time slot conflicts for the faculty
  const timeConflict = await models.TimetableSlotAssignment.findOne({
    where: {
      faculty_id,
      day_of_week,
      start_time,
      end_time,
      year: timetable.year,
      status: ['active', 'pending_approval']
    }
  });

  if (timeConflict) {
    throw new ErrorResponse('Faculty has a time conflict with another class at this time slot', 409);
  }

  // Check for class room conflict
  const roomConflict = await models.TimetableSlotAssignment.findOne({
    where: {
      class_id,
      day_of_week,
      start_time,
      end_time,
      room_number,
      status: ['active', 'pending_approval']
    }
  });

  if (roomConflict) {
    throw new ErrorResponse('Room is already booked for this time slot', 409);
  }

  // Create the assignment
  const assignment = await models.TimetableSlotAssignment.create({
    timetable_id,
    class_id,
    subject_code,
    subject_name,
    faculty_id,
    assigned_by: incharge_id,
    day_of_week,
    start_time,
    end_time,
    room_number,
    year: timetable.year,
    status: 'pending_approval'
  });

  // Create notification for faculty
  await models.TimetableNotification.create({
    slot_assignment_id: assignment.id,
    subject_code,
    subject_name,
    class_id,
    faculty_id,
    requested_by: incharge_id,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: assignment,
    message: 'Faculty assigned to slot. Notification sent to faculty.'
  });
});

/**
 * Change faculty assignment for a slot (reassign)
 */
export const changeFacultyAssignment = asyncHandler(async (req, res, next) => {
  const { faculty_id: incharge_id, department_id } = req.user;
  const { assignment_id } = req.params;
  const { new_faculty_id, reason } = req.body;

  if (!new_faculty_id) {
    throw new ErrorResponse('New faculty ID is required', 400);
  }

  // Get existing assignment
  const assignment = await models.TimetableSlotAssignment.findOne({
    where: { id: assignment_id },
    include: [
      {
        model: models.Timetable,
        attributes: ['id', 'year', 'department_id']
      }
    ]
  });

  if (!assignment) {
    throw new ErrorResponse('Assignment not found', 404);
  }

  // Verify incharge owns this assignment
  if (assignment.Timetable.department_id !== department_id) {
    throw new ErrorResponse('You do not have permission to modify this assignment', 403);
  }

  // Verify new faculty belongs to same department
  const newFaculty = await models.Faculty.findOne({
    where: { id: new_faculty_id, department_id }
  });

  if (!newFaculty) {
    throw new ErrorResponse('New faculty not found in your department', 404);
  }

  // Check if new faculty is already assigned to this subject in this class
  const duplicateAssignment = await models.TimetableSlotAssignment.findOne({
    where: {
      timetable_id: assignment.timetable_id,
      class_id: assignment.class_id,
      subject_code: assignment.subject_code,
      faculty_id: new_faculty_id,
      id: { [models.Sequelize.Op.ne]: assignment_id },
      status: ['active', 'pending_approval']
    }
  });

  if (duplicateAssignment) {
    throw new ErrorResponse('New faculty is already assigned to this subject for this class', 409);
  }

  // Check for time conflict with new faculty
  const timeConflict = await models.TimetableSlotAssignment.findOne({
    where: {
      faculty_id: new_faculty_id,
      day_of_week: assignment.day_of_week,
      start_time: assignment.start_time,
      end_time: assignment.end_time,
      year: assignment.Timetable.year,
      id: { [models.Sequelize.Op.ne]: assignment_id },
      status: ['active', 'pending_approval']
    }
  });

  if (timeConflict) {
    throw new ErrorResponse('New faculty has a time conflict at this time slot', 409);
  }

  // Record the old faculty for notification purposes
  const oldFacultyId = assignment.faculty_id;

  // Update assignment
  await assignment.update({
    faculty_id: new_faculty_id,
    status: 'pending_approval'
  });

  // Create new notification for new faculty
  await models.TimetableNotification.create({
    slot_assignment_id: assignment.id,
    subject_code: assignment.subject_code,
    subject_name: assignment.subject_name,
    class_id: assignment.class_id,
    faculty_id: new_faculty_id,
    requested_by: incharge_id,
    status: 'pending'
  });

  // Optionally notify old faculty about reassignment
  if (reason) {
    // Could create a separate alteration record or notification
    await models.TimetableAlteration.create({
      department_id,
      timetable_id: assignment.timetable_id,
      faculty_id: oldFacultyId,
      old_faculty_id: oldFacultyId,
      new_faculty_id,
      slot_assignment_id: assignment.id,
      reason: `Faculty reassigned: ${reason}`,
      status: 'approved',
      approved_by: incharge_id,
      approved_at: new Date()
    });
  }

  res.status(200).json({
    success: true,
    data: assignment,
    message: 'Faculty reassigned. New notification sent to updated faculty.'
  });
});

/**
 * Get available faculty for assignment to a class
 */
export const getAvailableFacultyForClass = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { timetable_id, class_id, subject_id, day_of_week, start_time, end_time, year } = req.query;

  // Base query: faculty in department, not on leave
  let available = await models.Faculty.findAll({
    where: { department_id },
    attributes: ['id', 'first_name', 'last_name', 'email'],
    include: [
      {
        model: models.Subject,
        through: { attributes: [] },
        where: subject_id ? { id: subject_id } : undefined,
        required: !!subject_id
      }
    ]
  });

  // Filter out faculty with time conflicts
  if (day_of_week && start_time && end_time && year) {
    available = await Promise.all(
      available.map(async (faculty) => {
        const conflict = await models.TimetableSlotAssignment.findOne({
          where: {
            faculty_id: faculty.id,
            day_of_week,
            start_time,
            end_time,
            year,
            status: ['active', 'pending_approval']
          }
        });
        return conflict ? null : faculty;
      })
    );
    available = available.filter(f => f !== null);
  }

  res.status(200).json({
    success: true,
    data: available
  });
});

/**
 * Get all slot assignments for a timetable
 */
export const getSlotAssignments = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { timetable_id } = req.params;

  const timetable = await models.Timetable.findOne({
    where: { id: timetable_id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  const assignments = await models.TimetableSlotAssignment.findAll({
    where: { timetable_id },
    include: [
      {
        model: models.Faculty,
        attributes: ['id', 'first_name', 'last_name', 'email']
      },
      {
        model: models.Subject,
        attributes: ['id', 'name', 'code']
      },
      {
        model: models.Class,
        attributes: ['id', 'name', 'year']
      }
    ],
    order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
  });

  res.status(200).json({
    success: true,
    data: assignments
  });
});

/**
 * Delete a slot assignment
 */
export const deleteSlotAssignment = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { assignment_id } = req.params;

  const assignment = await models.TimetableSlotAssignment.findOne({
    where: { id: assignment_id },
    include: [
      {
        model: models.Timetable,
        attributes: ['department_id']
      }
    ]
  });

  if (!assignment) {
    throw new ErrorResponse('Assignment not found', 404);
  }

  if (assignment.Timetable.department_id !== department_id) {
    throw new ErrorResponse('You do not have permission to delete this assignment', 403);
  }

  // Delete associated notifications
  await models.TimetableNotification.destroy({
    where: { slot_assignment_id: assignment_id }
  });

  await assignment.destroy();

  res.status(200).json({
    success: true,
    message: 'Slot assignment deleted successfully'
  });
});

/**
 * Publish timetable (mark as final)
 */
export const publishTimetable = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { timetable_id } = req.params;

  const timetable = await models.Timetable.findOne({
    where: { id: timetable_id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  // Check all critical assignments are approved
  const pendingAssignments = await models.TimetableSlotAssignment.findCount({
    where: {
      timetable_id,
      status: 'pending_approval'
    }
  });

  if (pendingAssignments > 0) {
    throw new ErrorResponse(`Cannot publish: ${pendingAssignments} assignments are still pending approval`, 400);
  }

  await timetable.update({ is_published: true });

  res.status(200).json({
    success: true,
    data: timetable,
    message: 'Timetable published successfully'
  });
});
