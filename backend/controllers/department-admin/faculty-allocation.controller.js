import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const { FacultySubjectAssignment, Subject, Faculty, Class, Department } = models;

// @desc      Allocate subject to faculty with class
// @route     POST /api/v1/department-admin/faculty-allocations
// @access    Private/DepartmentAdmin
export const allocateSubjectToFaculty = asyncHandler(async (req, res, next) => {
  const {
    faculty_id,
    subject_id,
    class_id,
    academic_year,
    semester,
    total_hours,
    no_of_periods
  } = req.body;

  // Validate required fields
  if (!faculty_id || !subject_id || !academic_year || !semester) {
    return next(new ErrorResponse('Please provide faculty_id, subject_id, academic_year, and semester', 400));
  }

  const departmentId = req.user.department_id;

  // Verify subject belongs to department
  const subject = await Subject.findOne({
    where: { id: subject_id, department_id: departmentId }
  });

  if (!subject) {
    return next(new ErrorResponse('Subject not found in your department', 404));
  }

  // Verify faculty belongs to department
  const faculty = await Faculty.findOne({
    where: { faculty_id, department_id: departmentId }
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found in your department', 404));
  }

  // If class_id provided, verify it belongs to department
  if (class_id) {
    const classExists = await Class.findOne({
      where: { id: class_id, department_id: departmentId }
    });

    if (!classExists) {
      return next(new ErrorResponse('Class not found in your department', 404));
    }
  }

  // Check if allocation already exists
  const existingAllocation = await FacultySubjectAssignment.findOne({
    where: {
      faculty_id,
      subject_id,
      academic_year,
      semester
    }
  });

  if (existingAllocation) {
    return next(new ErrorResponse('This allocation already exists', 400));
  }

  // Create allocation
  const allocation = await FacultySubjectAssignment.create({
    faculty_id,
    subject_id,
    class_id: class_id || null,
    academic_year,
    semester,
    total_hours: total_hours ? parseInt(total_hours) : 0,
    no_of_periods: no_of_periods ? parseInt(no_of_periods) : 0,
    assigned_by: req.user.id,
    assigned_at: new Date(),
    status: 'active'
  });

  // Reload with associations
  const createdAllocation = await FacultySubjectAssignment.findByPk(allocation.id, {
    include: [
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] },
      { model: Subject, as: 'subject', attributes: ['id', 'code', 'name', 'semester', 'sem_type', 'type', 'credits'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section'] }
    ]
  });

  res.status(201).json({
    success: true,
    data: createdAllocation
  });
});

// @desc      Get faculty allocations for department
// @route     GET /api/v1/department-admin/faculty-allocations
// @access    Private/DepartmentAdmin
export const getFacultyAllocations = asyncHandler(async (req, res, next) => {
  try {
    const { academic_year, semester, faculty_id, class_id, status } = req.query;
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return next(new ErrorResponse('Department ID not found in user', 400));
    }

    const where = {};
    if (academic_year) where.academic_year = academic_year;
    if (semester) where.semester = parseInt(semester);
    if (status) where.status = status;
    if (faculty_id) where.faculty_id = parseInt(faculty_id);
    if (class_id) where.class_id = parseInt(class_id);

    // Get subject IDs for this department
    const subjects = await Subject.findAll({
      where: { department_id: departmentId },
      attributes: ['id']
    });

    const subjectIds = subjects.map(s => s.id);
    if (subjectIds.length > 0) {
      where.subject_id = { [Op.in]: subjectIds };
    }

    const allocations = await FacultySubjectAssignment.findAll({
      where,
      include: [
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] },
        { model: Subject, as: 'subject', attributes: ['id', 'code', 'name', 'semester', 'sem_type', 'type'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch'] }
      ],
      order: [['academic_year', 'DESC'], ['semester', 'ASC'], ['faculty_id', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations
    });
  } catch (error) {
    console.error('Error fetching faculty allocations:', error);
    return next(new ErrorResponse(error.message || 'Error fetching allocations', 500));
  }
});

// @desc      Get allocation details
// @route     GET /api/v1/department-admin/faculty-allocations/:id
// @access    Private/DepartmentAdmin
export const getAllocationDetails = asyncHandler(async (req, res, next) => {
  const allocation = await FacultySubjectAssignment.findByPk(req.params.id, {
    include: [
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation', 'department_id'] },
      { model: Subject, as: 'subject', attributes: ['id', 'code', 'name', 'semester', 'sem_type', 'type', 'credits'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch', 'capacity'] }
    ]
  });

  if (!allocation) {
    return next(new ErrorResponse('Allocation not found', 404));
  }

  // Verify department access
  const subject = await Subject.findByPk(allocation.subject_id);
  if (subject.department_id !== req.user.department_id) {
    return next(new ErrorResponse('Unauthorized', 403));
  }

  res.status(200).json({
    success: true,
    data: allocation
  });
});

// @desc      Update allocation
// @route     PUT /api/v1/department-admin/faculty-allocations/:id
// @access    Private/DepartmentAdmin
export const updateAllocation = asyncHandler(async (req, res, next) => {
  let allocation = await FacultySubjectAssignment.findByPk(req.params.id);

  if (!allocation) {
    return next(new ErrorResponse('Allocation not found', 404));
  }

  // Verify department access
  const subject = await Subject.findByPk(allocation.subject_id);
  if (subject.department_id !== req.user.department_id) {
    return next(new ErrorResponse('Unauthorized', 403));
  }

  const { class_id, status, total_hours, no_of_periods } = req.body;

  // If class_id is being updated, verify it exists
  if (class_id) {
    const classExists = await Class.findOne({
      where: { id: class_id, department_id: req.user.department_id }
    });

    if (!classExists) {
      return next(new ErrorResponse('Class not found in your department', 404));
    }
  }

  allocation = await allocation.update({
    class_id: class_id !== undefined ? class_id : allocation.class_id,
    status: status || allocation.status,
    total_hours: total_hours !== undefined ? parseInt(total_hours) : allocation.total_hours,
    no_of_periods: no_of_periods !== undefined ? parseInt(no_of_periods) : allocation.no_of_periods
  });

  // Reload with associations
  const updatedAllocation = await FacultySubjectAssignment.findByPk(allocation.id, {
    include: [
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] },
      { model: Subject, as: 'subject', attributes: ['id', 'code', 'name', 'semester', 'sem_type', 'type', 'credits'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section'] }
    ]
  });

  res.status(200).json({
    success: true,
    data: updatedAllocation
  });
});

// @desc      Delete allocation
// @route     DELETE /api/v1/department-admin/faculty-allocations/:id
// @access    Private/DepartmentAdmin
export const deleteAllocation = asyncHandler(async (req, res, next) => {
  const allocation = await FacultySubjectAssignment.findByPk(req.params.id);

  if (!allocation) {
    return next(new ErrorResponse('Allocation not found', 404));
  }

  // Verify department access
  const subject = await Subject.findByPk(allocation.subject_id);
  if (subject.department_id !== req.user.department_id) {
    return next(new ErrorResponse('Unauthorized', 403));
  }

  await allocation.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get available subjects for faculty allocation
// @route     GET /api/v1/department-admin/allocation-subjects
// @access    Private/DepartmentAdmin
export const getAllocationSubjects = asyncHandler(async (req, res, next) => {
  try {
    const { semester, sem_type } = req.query;
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return next(new ErrorResponse('Department ID not found in user', 400));
    }

    const where = { department_id: departmentId, status: 'active' };
    if (semester) where.semester = parseInt(semester);
    if (sem_type) where.sem_type = sem_type;

    const subjects = await Subject.findAll({
      where,
      attributes: ['id', 'code', 'name', 'semester', 'sem_type', 'type', 'credits'],
      order: [['semester', 'ASC'], ['code', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching allocation subjects:', error);
    return next(new ErrorResponse(error.message || 'Error fetching subjects', 500));
  }
});

// @desc      Get available faculty for allocation
// @route     GET /api/v1/department-admin/allocation-faculty
// @access    Private/DepartmentAdmin
export const getAllocationFaculty = asyncHandler(async (req, res, next) => {
  try {
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return next(new ErrorResponse('Department ID not found in user', 400));
    }

    const faculty = await Faculty.findAll({
      where: { department_id: departmentId, status: 'active' },
      attributes: ['faculty_id', 'Name', 'email', 'designation', 'qualification'],
      order: [['Name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty
    });
  } catch (error) {
    console.error('Error fetching allocation faculty:', error);
    return next(new ErrorResponse(error.message || 'Error fetching faculty', 500));
  }
});

// @desc      Get available classes for allocation
// @route     GET /api/v1/department-admin/allocation-classes
// @access    Private/DepartmentAdmin
export const getAllocationClasses = asyncHandler(async (req, res, next) => {
  try {
    const { semester } = req.query;
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return next(new ErrorResponse('Department ID not found in user', 400));
    }

    const where = { department_id: departmentId, status: 'active' };
    if (semester) where.semester = parseInt(semester);

    const classes = await Class.findAll({
      where,
      attributes: ['id', 'name', 'section', 'semester', 'batch', 'capacity', 'room'],
      order: [['semester', 'ASC'], ['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching allocation classes:', error);
    return next(new ErrorResponse(error.message || 'Error fetching classes', 500));
  }
});

// @desc      Get faculty assignments for a specific academic year and semester
// @route     GET /api/v1/department-admin/faculty-allocations/year/:academic_year/sem/:semester
// @access    Private/DepartmentAdmin
export const getFacultyAllocationsBySemester = asyncHandler(async (req, res, next) => {
  const { academic_year, semester } = req.params;
  const departmentId = req.user.department_id;

  // Get subject IDs for this department
  const subjects = await Subject.findAll({
    where: { department_id: departmentId },
    attributes: ['id']
  });

  const subjectIds = subjects.map(s => s.id);

  const allocations = await FacultySubjectAssignment.findAll({
    where: {
      academic_year,
      semester,
      subject_id: { [models.sequelize.Op.in]: subjectIds }
    },
    include: [
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] },
      { model: Subject, as: 'subject', attributes: ['id', 'code', 'name', 'type', 'sem_type'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section', 'batch'] }
    ],
    order: [['faculty_id', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: allocations.length,
    data: allocations
  });
});

export default {
  allocateSubjectToFaculty,
  getFacultyAllocations,
  getAllocationDetails,
  updateAllocation,
  deleteAllocation,
  getAllocationSubjects,
  getAllocationFaculty,
  getAllocationClasses,
  getFacultyAllocationsBySemester
};
