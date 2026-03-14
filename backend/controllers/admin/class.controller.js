import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Class, Department } = models;

// @desc      Get all classes
// @route     GET /api/v1/admin/classes
// @access    Private/Admin
export const getAllClasses = asyncHandler(async (req, res, next) => {
  const classes = await Class.findAll({
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ],
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: classes.length,
    data: classes
  });
});

// @desc      Get single class
// @route     GET /api/v1/admin/classes/:id
// @access    Private/Admin
export const getClass = asyncHandler(async (req, res, next) => {
  const classRecord = await Class.findByPk(req.params.id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ]
  });

  if (!classRecord) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: classRecord
  });
});

// @desc      Create class
// @route     POST /api/v1/admin/classes
// @access    Private/Admin
export const createClass = asyncHandler(async (req, res, next) => {
  const { name, room, department_id, capacity, status, batch, semester, academic_year, section } = req.body;

  // Validate required fields
  if (!name) {
    return next(new ErrorResponse('Class name is required', 400));
  }

  if (!department_id) {
    return next(new ErrorResponse('Department is required', 400));
  }

  // Check if class already exists
  const existingClass = await Class.findOne({
    where: { name }
  });

  if (existingClass) {
    return next(new ErrorResponse('Class with this name already exists', 409));
  }

  const classRecord = await Class.create({
    name,
    room,
    department_id,
    capacity,
    status: status || 'active',
    batch,
    semester,
    academic_year,
    section
  });

  res.status(201).json({
    success: true,
    data: classRecord
  });
});

// @desc      Update class
// @route     PUT /api/v1/admin/classes/:id
// @access    Private/Admin
export const updateClass = asyncHandler(async (req, res, next) => {
  const { name, room, department_id, capacity, status, batch, semester, academic_year, section } = req.body;

  // Check if class exists
  const classRecord = await Class.findByPk(req.params.id);

  if (!classRecord) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }

  // Check if updated name already exists (excluding current class)
  if (name && name !== classRecord.name) {
    const existingClass = await Class.findOne({
      where: { name }
    });

    if (existingClass) {
      return next(new ErrorResponse('Class with this name already exists', 409));
    }
  }

  const updatedClass = await classRecord.update({
    name: name || classRecord.name,
    room: room !== undefined ? room : classRecord.room,
    department_id: department_id || classRecord.department_id,
    capacity: capacity !== undefined ? capacity : classRecord.capacity,
    status: status || classRecord.status,
    batch: batch !== undefined ? batch : classRecord.batch,
    semester: semester !== undefined ? semester : classRecord.semester,
    academic_year: academic_year || classRecord.academic_year,
    section: section || classRecord.section
  });

  res.status(200).json({
    success: true,
    data: updatedClass
  });
});

// @desc      Delete class
// @route     DELETE /api/v1/admin/classes/:id
// @access    Private/Admin
export const deleteClass = asyncHandler(async (req, res, next) => {
  const classRecord = await Class.findByPk(req.params.id);

  if (!classRecord) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }

  await classRecord.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});
