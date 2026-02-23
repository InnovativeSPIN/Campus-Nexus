import express from 'express';
import { protect } from '../middleware/auth.js';
import { models } from '../models/index.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

const { Class: ClassModel, Department } = models;

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/classes
// @desc    Get all classes (for general use in forms/dropdowns) 
// @access  Private
const getClasses = asyncHandler(async (req, res, next) => {
  const { department_id, batch, semester } = req.query;

  let where = {};
  
  // If user has department_id in their profile, filter by it
  if (req.user.department_id) {
    where.department_id = req.user.department_id;
  } else if (department_id) {
    where.department_id = department_id;
  }
  
  if (batch) where.batch = batch;
  if (semester) where.semester = semester;

  const classes = await ClassModel.findAll({
    where,
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ],
    attributes: ['id', 'name', 'section', 'room', 'semester', 'batch', 'capacity'],
    order: [['semester', 'ASC'], ['section', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: classes.length,
    data: classes
  });
});

// @route   GET /api/v1/classes/:id
// @desc    Get single class
// @access  Private
const getClass = asyncHandler(async (req, res, next) => {
  const classRecord = await ClassModel.findByPk(req.params.id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ]
  });

  if (!classRecord) {
    return next(new ErrorResponse('Class not found', 404));
  }

  res.status(200).json({
    success: true,
    data: classRecord
  });
});

router.route('/')
  .get(getClasses);

router.route('/:id')
  .get(getClass);

export default router;