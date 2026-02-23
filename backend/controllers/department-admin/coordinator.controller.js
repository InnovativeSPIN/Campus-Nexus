import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const { Faculty, Department } = models;

// @route   GET /api/v1/department-admin/coordinators
// @desc    Get all faculty with coordinator assignments
// @access  Private (Department Admin)
export const getAllCoordinators = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;

  const faculty = await Faculty.findAll({
    where: { department_id: departmentId },
    attributes: [
      'faculty_id',
      'Name',
      'email',
      'designation',
      'is_timetable_incharge',
      'is_placement_coordinator',
    ],
    order: [['Name', 'ASC']],
  });

  res.status(200).json({
    success: true,
    data: faculty,
  });
});

// @route   GET /api/v1/department-admin/coordinators/:id
// @desc    Get coordinator details
// @access  Private (Department Admin)
export const getCoordinatorDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const faculty = await Faculty.findOne({
    where: { faculty_id: id, department_id: departmentId },
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found', 404));
  }

  res.status(200).json({
    success: true,
    data: faculty,
  });
});

// @route   PUT /api/v1/department-admin/coordinators/:id/assign-timetable
// @desc    Assign faculty as timetable incharge
// @access  Private (Department Admin)
export const assignTimetableIncharge = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const faculty = await Faculty.findOne({
    where: { faculty_id: id, department_id: departmentId },
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found', 404));
  }

  faculty.is_timetable_incharge = true;
  await faculty.save();

  res.status(200).json({
    success: true,
    message: `${faculty.Name} has been assigned as timetable incharge`,
    data: faculty,
  });
});

// @route   PUT /api/v1/department-admin/coordinators/:id/remove-timetable
// @desc    Remove faculty from timetable incharge
// @access  Private (Department Admin)
export const removeTimetableIncharge = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const faculty = await Faculty.findOne({
    where: { faculty_id: id, department_id: departmentId },
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found', 404));
  }

  faculty.is_timetable_incharge = false;
  await faculty.save();

  res.status(200).json({
    success: true,
    message: `${faculty.Name} has been removed from timetable incharge`,
    data: faculty,
  });
});

// @route   PUT /api/v1/department-admin/coordinators/:id/assign-placement
// @desc    Assign faculty as placement coordinator
// @access  Private (Department Admin)
export const assignPlacementCoordinator = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const faculty = await Faculty.findOne({
    where: { faculty_id: id, department_id: departmentId },
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found', 404));
  }

  faculty.is_placement_coordinator = true;
  await faculty.save();

  res.status(200).json({
    success: true,
    message: `${faculty.Name} has been assigned as placement coordinator`,
    data: faculty,
  });
});

// @route   PUT /api/v1/department-admin/coordinators/:id/remove-placement
// @desc    Remove faculty from placement coordinator
// @access  Private (Department Admin)
export const removePlacementCoordinator = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const faculty = await Faculty.findOne({
    where: { faculty_id: id, department_id: departmentId },
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found', 404));
  }

  faculty.is_placement_coordinator = false;
  await faculty.save();

  res.status(200).json({
    success: true,
    message: `${faculty.Name} has been removed from placement coordinator`,
    data: faculty,
  });
});
