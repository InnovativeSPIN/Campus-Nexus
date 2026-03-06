import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Timetable, Faculty } = models;

// Middleware to check if faculty is timetable incharge
export const checkTimetableIncharge = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findByPk(req.user.faculty_id);

  if (!faculty || !faculty.is_timetable_incharge) {
    return next(new ErrorResponse('You are not authorized as timetable incharge', 403));
  }

  next();
});

// @route   GET /api/v1/faculty/timetable/alterations
// @desc    Get timetable alterations (own or all if incharge/admin)
// @access  Private (Faculty / Timetable Incharge)
export const getTimetableAlterations = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  const facultyId = req.user.faculty_id;

  // Let's check if the faculty is an incharge
  const faculty = await Faculty.findByPk(facultyId);
  const isIncharge = faculty && faculty.is_timetable_incharge;

  const whereClause = { department_id: departmentId };

  if (!isIncharge) {
    // If not incharge, they can only view requests they created, or where they are the new/old faculty
    whereClause[Op.or] = [
      { requested_by: facultyId },
      { old_faculty_id: facultyId },
      { new_faculty_id: facultyId }
    ];
  }

  const alterations = await models.TimetableAlteration.findAll({
    where: whereClause,
    include: [
      {
        model: models.Department,
        as: 'department',
        attributes: ['short_name', 'full_name'],
      },
      {
        model: Faculty,
        as: 'oldFaculty',
        attributes: ['faculty_id', 'Name', 'email'],
      },
      {
        model: Faculty,
        as: 'newFaculty',
        attributes: ['faculty_id', 'Name', 'email'],
      }
    ],
    order: [['created_at', 'DESC']],
  });

  // Enrich alterations with timetable slot information
  // map alterations to include stored slot details
  const enrichedAlterations = alterations.map((alt) => {
    const altObj = alt.toJSON ? alt.toJSON() : alt;

    return {
      id: altObj.id,
      department_id: altObj.department_id,
      semester: altObj.semester,
      old_faculty_id: altObj.old_faculty_id,
      new_faculty_id: altObj.new_faculty_id,
      status: altObj.status,
      created_at: altObj.created_at,
      createdAt: altObj.created_at,
      updated_at: altObj.updated_at,
      reason: altObj.reason,
      proposed_date: altObj.proposed_date,
      requested_by: altObj.requested_by,
      approved_by: altObj.approved_by,
      approval_date: altObj.approval_date,
      // use saved slot details
      day: altObj.day,
      hour: altObj.hour,
      section: altObj.section,
      subject: altObj.subject,
      year: altObj.year || altObj.semester,
      // Include faculty names for display
      replacementFacultyId: altObj.newFaculty?.faculty_id || altObj.new_faculty_id,
      replacementFacultyName: altObj.newFaculty 
        ? altObj.newFaculty.Name 
        : 'TBA'
    };
  });

  res.status(200).json({
    success: true,
    data: enrichedAlterations,
  });
});

// Helper functions to extract info from reason string
const extractDayFromReason = (reason) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (const day of days) {
    if (reason.includes(day)) {
      return day;
    }
  }
  return null;
};

const extractHourFromReason = (reason) => {
  const match = reason.match(/Hour\s+(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const extractSubjectFromReason = (reason) => {
  // Extract subject from reason string like "Temporary substitution for Monday Hour 1 - SubjectName"
  const match = reason.match(/\s-\s(.+)$/);
  return match ? match[1] : null;
};

// @route   POST /api/v1/faculty/timetable/alterations
// @desc    Create timetable alteration request (Swap/Substitute Request)
// @access  Private (Faculty)
export const createTimetableAlteration = asyncHandler(async (req, res, next) => {
  const { semester, slot_id, old_faculty_id, new_faculty_id, reason, proposed_date } = req.body;
  const departmentId = req.user.department_id;

  // Validate input
  if (!semester || !slot_id || !old_faculty_id || !new_faculty_id || !reason) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Create alteration record
  const alteration = await models.TimetableAlteration.create({
    department_id: departmentId,
    semester,
    slot_id,
    old_faculty_id,
    new_faculty_id,
    reason,
    proposed_date,
    requested_by: req.user.faculty_id,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Timetable alteration request created successfully',
    data: alteration,
  });
});

// @route   GET /api/v1/faculty/timetable/alterations/:id
// @desc    Get specific timetable alteration details
// @access  Private (Faculty)
export const getTimetableAlterationDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;
  const facultyId = req.user.faculty_id;

  const faculty = await Faculty.findByPk(facultyId);
  const isIncharge = faculty && faculty.is_timetable_incharge;

  const alteration = await models.TimetableAlteration.findOne({
    where: { id, department_id: departmentId },
    include: [
      {
        model: Faculty,
        as: 'oldFaculty',
        attributes: ['faculty_id', 'Name', 'email'],
      },
      {
        model: Faculty,
        as: 'newFaculty',
        attributes: ['faculty_id', 'Name', 'email'],
      },
    ],
  });

  if (!alteration) {
    return next(new ErrorResponse('Timetable alteration not found', 404));
  }

  // Verification if they are allowed to see it
  if (!isIncharge && alteration.requested_by !== facultyId && alteration.old_faculty_id !== facultyId && alteration.new_faculty_id !== facultyId) {
    return next(new ErrorResponse('You are not authorized to view this request', 403));
  }

  res.status(200).json({
    success: true,
    data: alteration,
  });
});

// @route   PUT /api/v1/faculty/timetable/alterations/:id
// @desc    Update timetable alteration
// @access  Private (Faculty)
export const updateTimetableAlteration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason, proposed_date } = req.body;
  const departmentId = req.user.department_id;

  let alteration = await models.TimetableAlteration.findOne({
    where: { id, department_id: departmentId },
  });

  if (!alteration) {
    return next(new ErrorResponse('Timetable alteration not found', 404));
  }

  // Only allow updates if status is pending
  if (alteration.status !== 'pending') {
    return next(new ErrorResponse('Cannot update an alteration that is not pending', 400));
  }

  if (reason) alteration.reason = reason;
  if (proposed_date) alteration.proposed_date = proposed_date;

  await alteration.save();

  res.status(200).json({
    success: true,
    message: 'Timetable alteration updated successfully',
    data: alteration,
  });
});

// @route   DELETE /api/v1/faculty/timetable/alterations/:id
// @desc    Delete timetable alteration request
// @access  Private (Faculty)
export const deleteTimetableAlteration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const alteration = await models.TimetableAlteration.findOne({
    where: { id, department_id: departmentId },
  });

  if (!alteration) {
    return next(new ErrorResponse('Timetable alteration not found', 404));
  }

  // Only requested user or incharge can delete it
  const faculty = await Faculty.findByPk(req.user.faculty_id);
  const isIncharge = faculty && faculty.is_timetable_incharge;

  if (!isIncharge && alteration.requested_by !== req.user.faculty_id) {
    return next(new ErrorResponse('You are not authorized to delete this request', 403));
  }

  // Only allow deletion if status is pending
  if (alteration.status !== 'pending') {
    return next(new ErrorResponse('Cannot delete an alteration that is not pending', 400));
  }

  await alteration.destroy();

  res.status(200).json({
    success: true,
    message: 'Timetable alteration deleted successfully',
  });
});
