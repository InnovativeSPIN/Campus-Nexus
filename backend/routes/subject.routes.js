import express from 'express';
import { protect } from '../middleware/auth.js';
import { models } from '../models/index.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

const { Subject, Department } = models;

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/subjects
// @desc    Get all subjects (for general use in forms/dropdowns)
// @access  Private
const getSubjects = asyncHandler(async (req, res, next) => {
  const { department_id, semester, status } = req.query;

  let where = {};
  
  // If user has department_id in their profile, filter by it
  if (req.user.department_id) {
    where.department_id = req.user.department_id;
  } else if (department_id) {
    where.department_id = department_id;
  }
  
  if (semester) where.semester = semester;
  if (status) where.status = status;
  
  // Default to active subjects only
  if (!status) where.status = 'active';

  const subjects = await Subject.findAll({
    where,
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ],
    attributes: ['id', 'name', 'code', 'semester', 'credits', 'type', 'is_elective'],
    order: [['semester', 'ASC'], ['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects
  });
});

// @route   GET /api/v1/subjects/:id
// @desc    Get single subject
// @access  Private
const getSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findByPk(req.params.id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ]
  });

  if (!subject) {
    return next(new ErrorResponse('Subject not found', 404));
  }

  res.status(200).json({
    success: true,
    data: subject
  });
});

router.route('/')
  .get(getSubjects);

router.route('/:id')
  .get(getSubject);

export default router;