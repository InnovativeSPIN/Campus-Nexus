import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Subject, Department, Class } = models;

// @desc      Get all subjects with filters
// @route     GET /api/v1/admin/subjects
// @access    Private/SuperAdmin
export const getSubjects = asyncHandler(async (req, res, next) => {
  try {
    const { department_id, semester, sem_type, status, is_elective } = req.query;
    const where = {};

    if (department_id) where.department_id = parseInt(department_id);
    if (semester) where.semester = parseInt(semester);
    if (sem_type) where.sem_type = sem_type;
    if (status) where.status = status;
    if (is_elective !== undefined) where.is_elective = is_elective === 'true';

    const subjects = await Subject.findAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] }
      ],
      order: [['department_id', 'ASC'], ['semester', 'ASC'], ['subject_code', 'ASC']]
    });

    // Format response with proper field names
    const result = subjects.map(s => {
      const subject = s.toJSON();
      return {
        id: subject.id,
        code: subject.subject_code,
        name: subject.subject_name,
        description: subject.description,
        department_id: subject.department_id,
        department: subject.department,
        semester: subject.semester,
        sem_type: subject.sem_type,
        credits: subject.credits,
        type: subject.type,
        is_elective: subject.is_elective,
        is_laboratory: subject.is_laboratory,
        status: subject.status,
        created_at: subject.created_at,
        updated_at: subject.updated_at
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error in getSubjects:', error);
    return next(new ErrorResponse(error.message || 'Error fetching subjects', 500));
  }
});

// @desc      Get single subject
// @route     GET /api/v1/admin/subjects/:id
// @access    Private/SuperAdmin
export const getSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section'] }
    ]
  });

  if (!subject) {
    return next(new ErrorResponse(`Subject not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: subject
  });
});

// @desc      Create subject
// @route     POST /api/v1/admin/subjects
// @access    Private/SuperAdmin
export const createSubject = asyncHandler(async (req, res, next) => {
  const {
    code,
    name,
    description,
    department_id,
    semester,
    sem_type,
    credits,
    type,
    is_elective,
    is_laboratory,
    class_id,
    min_hours_per_week,
    max_students,
    status
  } = req.body;

  // Validate required fields
  if (!code || !name || !department_id || !semester) {
    return next(new ErrorResponse('Please provide code, name, department_id, and semester', 400));
  }

  // Check if code already exists
  const existingSubject = await Subject.findOne({ where: { subject_code: code } });
  if (existingSubject) {
    return next(new ErrorResponse(`Subject code "${code}" already exists`, 400));
  }

  // Validate semester is 1-8
  if (semester < 1 || semester > 8) {
    return next(new ErrorResponse('Semester must be between 1 and 8', 400));
  }

  // Validate sem_type is odd or even
  if (sem_type && !['odd', 'even'].includes(sem_type)) {
    return next(new ErrorResponse('Semester type must be either "odd" or "even"', 400));
  }

  const subject = await Subject.create({
    subject_code: code,
    subject_name: name,
    description,
    department_id: parseInt(department_id),
    semester: parseInt(semester),
    sem_type: sem_type || 'odd',
    credits: credits ? parseFloat(credits) : 4.0,
    type: type || 'Theory',
    is_elective: is_elective || false,
    is_laboratory: is_laboratory || false,
    class_id: class_id || null,
    min_hours_per_week: min_hours_per_week || 3,
    max_students: max_students || null,
    status: status || 'active',
    created_by: req.user?.id || 1
  });

  // Reload with associations
  const createdSubject = await Subject.findByPk(subject.id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] }
    ]
  });

  // Format response
  const formatted = createdSubject.toJSON();
  res.status(201).json({
    success: true,
    data: {
      id: formatted.id,
      code: formatted.subject_code,
      name: formatted.subject_name,
      description: formatted.description,
      department_id: formatted.department_id,
      department: formatted.department,
      semester: formatted.semester,
      sem_type: formatted.sem_type,
      credits: formatted.credits,
      type: formatted.type,
      is_elective: formatted.is_elective,
      is_laboratory: formatted.is_laboratory,
      status: formatted.status,
      created_at: formatted.created_at,
      updated_at: formatted.updated_at
    }
  });
});

// @desc      Update subject
// @route     PUT /api/v1/admin/subjects/:id
// @access    Private/SuperAdmin
export const updateSubject = asyncHandler(async (req, res, next) => {
  let subject = await Subject.findByPk(req.params.id);

  if (!subject) {
    return next(new ErrorResponse(`Subject not found with id of ${req.params.id}`, 404));
  }

  const {
    code,
    name,
    description,
    semester,
    sem_type,
    credits,
    type,
    is_elective,
    is_laboratory,
    class_id,
    min_hours_per_week,
    max_students,
    status
  } = req.body;

  // If code is being changed, check for duplicates
  if (code && code !== subject.code) {
    const existingSubject = await Subject.findOne({ where: { code } });
    if (existingSubject) {
      return next(new ErrorResponse(`Subject code "${code}" already exists`, 400));
    }
  }

  // Validate semester if provided
  if (semester && (semester < 1 || semester > 8)) {
    return next(new ErrorResponse('Semester must be between 1 and 8', 400));
  }

  // Validate sem_type if provided
  if (sem_type && !['odd', 'even'].includes(sem_type)) {
    return next(new ErrorResponse('Semester type must be either "odd" or "even"', 400));
  }

  // Update subject
  subject = await subject.update({
    code: code || subject.code,
    name: name || subject.name,
    description: description !== undefined ? description : subject.description,
    semester: semester || subject.semester,
    sem_type: sem_type || subject.sem_type,
    credits: credits !== undefined ? credits : subject.credits,
    type: type || subject.type,
    is_elective: is_elective !== undefined ? is_elective : subject.is_elective,
    is_laboratory: is_laboratory !== undefined ? is_laboratory : subject.is_laboratory,
    class_id: class_id !== undefined ? class_id : subject.class_id,
    min_hours_per_week: min_hours_per_week !== undefined ? min_hours_per_week : subject.min_hours_per_week,
    max_students: max_students !== undefined ? max_students : subject.max_students,
    status: status || subject.status
  });

  // Reload with associations
  const updatedSubject = await Subject.findByPk(subject.id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section'] }
    ]
  });

  res.status(200).json({
    success: true,
    data: updatedSubject
  });
});

// @desc      Delete subject
// @route     DELETE /api/v1/admin/subjects/:id
// @access    Private/SuperAdmin
export const deleteSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findByPk(req.params.id);

  if (!subject) {
    return next(new ErrorResponse(`Subject not found with id of ${req.params.id}`, 404));
  }

  await subject.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get subjects by department and semester
// @route     GET /api/v1/admin/subjects/dept/:department_id/sem/:semester
// @access    Private/SuperAdmin
export const getSubjectsByDepartmentAndSemester = asyncHandler(async (req, res, next) => {
  const { department_id, semester } = req.params;
  const { sem_type } = req.query;

  const where = { department_id, semester };
  if (sem_type) where.sem_type = sem_type;

  const subjects = await Subject.findAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] }
    ],
    order: [['code', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects
  });
});

// @desc      Get all departments with available semesters
// @route     GET /api/v1/admin/subjects/departments-semesters
// @access    Private/SuperAdmin
export const getDepartmentsSemesters = asyncHandler(async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'short_name', 'full_name'],
      order: [['short_name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: departments.map(d => ({
        id: d.id,
        short_name: d.short_name,
        full_name: d.full_name
      })),
      semesters: Array.from({ length: 8 }, (_, i) => i + 1),
      semTypes: ['odd', 'even'],
      subjectTypes: ['Theory', 'Practical', 'Theory+Practical', 'Project', 'Seminar', 'Internship']
    });
  } catch (error) {
    console.error('Error in getDepartmentsSemesters:', error);
    return next(new ErrorResponse(error.message || 'Error fetching departments', 500));
  }
});

export default {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByDepartmentAndSemester,
  getDepartmentsSemesters
};
