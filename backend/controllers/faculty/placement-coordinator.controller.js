import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const { Faculty, Student } = models;

// Middleware to check if faculty is placement coordinator
export const checkPlacementCoordinator = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findByPk(req.user.faculty_id);

  if (!faculty || !faculty.is_placement_coordinator) {
    return next(new ErrorResponse('You are not authorized as placement coordinator', 403));
  }

  next();
});

// @route   GET /api/v1/faculty/placement/overview
// @desc    Get placement coordination dashboard
// @access  Private (Faculty - Placement Coordinator)
export const getPlacementOverview = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;

  // Get students in the department
  const students = await Student.findAll({
    where: { departmentId },
    include: [
      {
        model: models.Department,
        as: 'department',
        attributes: ['short_name', 'full_name'],
      },
    ],
    order: [['rollNumber', 'ASC']],
  });

  res.status(200).json({
    success: true,
    data: {
      totalStudents: students.length,
      students: students,
    },
  });
});

// @route   GET /api/v1/faculty/placement/drives
// @desc    Get all placement drives
// @access  Private (Faculty - Placement Coordinator)
export const getPlacementDrives = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;

  // Get placement drives for the department
  const drives = await models.PlacementDrive.findAll({
    where: { department_id: departmentId },
    order: [['date', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: drives,
  });
});

// @route   POST /api/v1/faculty/placement/drives
// @desc    Create placement drive
// @access  Private (Faculty - Placement Coordinator)
export const createPlacementDrive = asyncHandler(async (req, res, next) => {
  // destructure package using alias to avoid reserved-word error
  const { company_name, position, date, description, package: pkg } = req.body;
  const departmentId = req.user.department_id;

  if (!company_name || !position || !pkg) {
    return next(new ErrorResponse('Company name, position, and package are required', 400));
  }

  const drive = await models.PlacementDrive.create({
    company_name,
    position,
    package: pkg,
    date,
    description,
    department_id: departmentId,
    created_by: req.user.faculty_id,
  });

  res.status(201).json({
    success: true,
    message: 'Placement drive created successfully',
    data: drive,
  });
});

// @route   GET /api/v1/faculty/placement/stats
// @desc    Get placement statistics
// @access  Private (Faculty - Placement Coordinator)
export const getPlacementStats = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;

  const students = await Student.findAll({
    where: { departmentId },
  });

  // Mock stats - you can replace with actual data from a placements table
  const totalStudents = students.length;
  const placedStudents = 0; // To be replaced with actual placement data
  const placementPercentage = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      placedStudents,
      placementPercentage: placementPercentage.toFixed(2),
      averagePackage: 0, // To be replaced with actual data
    },
  });
});

// @route   GET /api/v1/faculty/placement/drives/:driveId/students
// @desc    Get students registered for a drive
// @access  Private (Faculty - Placement Coordinator)
export const getDriveRegistrations = asyncHandler(async (req, res, next) => {
  const { driveId } = req.params;

  if (!models.DriveRegistration) {
    return next(new ErrorResponse('Registration system not yet configured', 501));
  }

  const registrations = await models.DriveRegistration.findAll({
    where: { drive_id: driveId },
    include: [
      {
        model: Student,
        attributes: ['id', 'rollNumber', 'firstName', 'lastName', 'email'],
      },
    ],
  });

  res.status(200).json({
    success: true,
    data: registrations,
  });
});
