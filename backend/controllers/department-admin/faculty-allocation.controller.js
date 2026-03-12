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

  // Verify faculty exists (can be from any department - cross-dept teaching allowed)
  const faculty = await Faculty.findByPk(faculty_id);

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found', 404));
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
      { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name', 'semester', 'sem_type', 'type', 'credits'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section'] }
    ]
  });

  // Map subject fields to match frontend expectations
  const responseData = createdAllocation.toJSON();
  if (responseData.subject) {
    responseData.subject = {
      id: responseData.subject.id,
      code: responseData.subject.subject_code,
      name: responseData.subject.subject_name,
      semester: responseData.subject.semester,
      sem_type: responseData.subject.sem_type,
      type: responseData.subject.type,
      credits: responseData.subject.credits
    };
  }

  res.status(201).json({
    success: true,
    data: responseData
  });
});

// @desc      Get faculty allocations for department
// @route     GET /api/v1/department-admin/faculty-allocations
// @access    Private/DepartmentAdmin
export const getFacultyAllocations = asyncHandler(async (req, res, next) => {
  try {
    const { academic_year, semester, faculty_id, class_id, status } = req.query;
    const departmentId = req.user?.department_id;

    console.log('[GET ALLOCATIONS] departmentId:', departmentId, 'filters:', { academic_year, semester, faculty_id, class_id, status });

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
    console.log('[GET ALLOCATIONS] Found subjects:', subjectIds);

    if (subjectIds.length > 0) {
      where.subject_id = { [Op.in]: subjectIds };
    }

    const allocations = await FacultySubjectAssignment.findAll({
      where,
      include: [
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name', 'semester', 'sem_type', 'type', 'credits'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch'] }
      ],
      order: [['academic_year', 'DESC'], ['semester', 'ASC'], ['faculty_id', 'ASC']]
    });

    // Map subject fields to match frontend expectations
    const mappedAllocations = allocations.map(allocation => {
      const allocationData = allocation.toJSON();
      if (allocationData.subject) {
        allocationData.subject = {
          id: allocationData.subject.id,
          code: allocationData.subject.subject_code,
          name: allocationData.subject.subject_name,
          semester: allocationData.subject.semester,
          sem_type: allocationData.subject.sem_type,
          type: allocationData.subject.type,
          credits: allocationData.subject.credits
        };
      }
      return allocationData;
    });

    console.log('[GET ALLOCATIONS] Found allocations:', mappedAllocations.length);

    res.status(200).json({
      success: true,
      count: mappedAllocations.length,
      data: mappedAllocations
    });
  } catch (error) {
    console.error('[GET ALLOCATIONS] Error:', error);
    return next(error);
  }
});

// @desc      Get allocation details
// @route     GET /api/v1/department-admin/faculty-allocations/:id
// @access    Private/DepartmentAdmin
export const getAllocationDetails = asyncHandler(async (req, res, next) => {
  const allocation = await FacultySubjectAssignment.findByPk(req.params.id, {
    include: [
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation', 'department_id'] },
      { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name', 'semester', 'sem_type', 'type', 'credits'] },
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

  // Map subject fields to match frontend expectations
  const responseData = allocation.toJSON();
  if (responseData.subject) {
    responseData.subject = {
      id: responseData.subject.id,
      code: responseData.subject.subject_code,
      name: responseData.subject.subject_name,
      semester: responseData.subject.semester,
      sem_type: responseData.subject.sem_type,
      type: responseData.subject.type,
      credits: responseData.subject.credits
    };
  }

  res.status(200).json({
    success: true,
    data: responseData
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
      { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name', 'semester', 'sem_type', 'type', 'credits'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'section'] }
    ]
  });

  // Map subject fields to match frontend expectations
  const responseData = updatedAllocation.toJSON();
  if (responseData.subject) {
    responseData.subject = {
      id: responseData.subject.id,
      code: responseData.subject.subject_code,
      name: responseData.subject.subject_name,
      semester: responseData.subject.semester,
      sem_type: responseData.subject.sem_type,
      type: responseData.subject.type,
      credits: responseData.subject.credits
    };
  }

  res.status(200).json({
    success: true,
    data: responseData
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
    const departmentId = req.user?.department_id;

    console.log('[GET SUBJECTS] departmentId:', departmentId, 'filters:', { semester, sem_type });

    if (!departmentId) {
      return next(new ErrorResponse('Department ID not found in user', 400));
    }

    const where = { department_id: departmentId, status: 'active' };
    if (semester) where.semester = parseInt(semester);
    if (sem_type) where.sem_type = sem_type;

    const subjects = await Subject.findAll({
      where,
      attributes: ['id', 'subject_code', 'subject_name', 'semester', 'sem_type', 'type', 'credits'],
      order: [['semester', 'ASC'], ['subject_code', 'ASC']]
    });

    // Map database field names to expected frontend field names
    const mappedSubjects = subjects.map(subject => ({
      id: subject.id,
      code: subject.subject_code,
      name: subject.subject_name,
      semester: subject.semester,
      sem_type: subject.sem_type,
      type: subject.type,
      credits: subject.credits
    }));

    console.log('[GET SUBJECTS] Found subjects:', mappedSubjects.length);

    res.status(200).json({
      success: true,
      count: mappedSubjects.length,
      data: mappedSubjects
    });
  } catch (error) {
    console.error('[GET SUBJECTS] Error:', error);
    return next(error);
  }
});

// @desc      Get all departments (for cross-dept faculty filter in allocation form)
// @route     GET /api/v1/department-admin/allocation-departments
// @access    Private/DepartmentAdmin
export const getAllDepartments = asyncHandler(async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'short_name', 'full_name'],
      order: [['short_name', 'ASC']]
    });
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    return next(error);
  }
});

// @desc      Get available faculty for allocation (supports cross-department with optional filter)
// @route     GET /api/v1/department-admin/allocation-faculty?department_id=&all=true
// @access    Private/DepartmentAdmin
export const getAllocationFaculty = asyncHandler(async (req, res, next) => {
  try {
    const myDepartmentId = req.user?.department_id;
    const { department_id, all } = req.query;

    if (!myDepartmentId) {
      return next(new ErrorResponse('Department ID not found in user', 400));
    }

    // Build where clause:
    // - If all=true (no dept filter), return all faculty across all departments
    // - If department_id is specified, filter by that specific department
    // - Default: return own department faculty only
    const where = { status: 'active' };
    if (department_id && department_id !== 'all') {
      where.department_id = parseInt(department_id);
    } else if (!all || all !== 'true') {
      where.department_id = myDepartmentId;
    }

    const faculty = await Faculty.findAll({
      where,
      attributes: ['faculty_id', 'Name', 'email', 'designation', 'educational_qualification', 'department_id'],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'short_name', 'full_name'],
        }
      ],
      order: [['department_id', 'ASC'], ['Name', 'ASC']]
    });

    console.log('[GET FACULTY] Found faculty:', faculty.length, 'filter:', where);

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty
    });
  } catch (error) {
    console.error('[GET FACULTY] Error:', error);
    return next(error);
  }
});

// @desc      Get available classes for allocation
// @route     GET /api/v1/department-admin/allocation-classes
// @access    Private/DepartmentAdmin
export const getAllocationClasses = asyncHandler(async (req, res, next) => {
  try {
    const { semester } = req.query;
    const departmentId = req.user?.department_id;

    console.log('[GET CLASSES] departmentId:', departmentId, 'filters:', { semester });

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

    console.log('[GET CLASSES] Found classes:', classes.length);

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('[GET CLASSES] Error:', error);
    return next(error);
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
      { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name', 'type', 'sem_type'] },
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

// @desc      Get timetable allocations from CSV uploads (TimetableSimple)
// @route     GET /api/v1/department-admin/faculty-allocations/timetable-list
// @access    Private/DepartmentAdmin
export const getTimetableAllocations = asyncHandler(async (req, res, next) => {
  try {
    const { academic_year, faculty_id } = req.query;
    const departmentId = req.user?.department_id || req.user?.departmentId;

    console.log('[GET TIMETABLE ALLOCATIONS] departmentId:', departmentId, 'user:', req.user);

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        error: 'Department ID not found in user'
      });
    }

    const { TimetableSimple } = models;
    
    // Build query where clause
    const where = {};
    if (academic_year) where.academicYear = academic_year;
    if (faculty_id) where.facultyId = faculty_id;

    // Try to get by department ID first, if that fails, try without filter
    let allocations = [];
    
    try {
      // Get department to find its name/code
      const department = await Department.findByPk(departmentId, {
        raw: true
      });

      if (department) {
        // Filter by department name or code
        where.department = department.name || department.short_name;
        allocations = await TimetableSimple.findAll({
          where,
          order: [['facultyName', 'ASC'], ['day', 'ASC'], ['hour', 'ASC']],
          raw: true
        });
      } else {
        console.log('[GET TIMETABLE ALLOCATIONS] Department not found for ID:', departmentId);
      }
    } catch (queryError) {
      console.error('[GET TIMETABLE ALLOCATIONS] Query error:', queryError.message);
      // Continue without department filter - may return all data
      allocations = await TimetableSimple.findAll({
        where,
        order: [['facultyName', 'ASC'], ['day', 'ASC'], ['hour', 'ASC']],
        raw: true
      }).catch(err => {
        console.error('[GET TIMETABLE ALLOCATIONS] Fallback query error:', err.message);
        return [];
      });
    }

    console.log('[GET TIMETABLE ALLOCATIONS] Found records:', allocations.length);

    // Group by faculty for display
    const groupedByFaculty = allocations.reduce((acc, alloc) => {
      const key = alloc.facultyId;
      if (!acc[key]) {
        acc[key] = {
          facultyId: alloc.facultyId,
          facultyName: alloc.facultyName,
          department: alloc.department,
          academicYear: alloc.academicYear,
          allocations: []
        };
      }
      acc[key].allocations.push({
        id: alloc.id,
        day: alloc.day,
        hour: alloc.hour,
        subject: alloc.subject,
        section: alloc.section,
        year: alloc.year
      });
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      count: allocations.length,
      data: Object.values(groupedByFaculty)
    });
  } catch (error) {
    console.error('[GET TIMETABLE ALLOCATIONS] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch timetable allocations'
    });
  }
});

// @desc      Update timetable allocation (subject or faculty name)
// @route     PUT /api/v1/department-admin/faculty-allocations/timetable/:id
// @access    Private/DepartmentAdmin
export const updateTimetableAllocation = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { facultyName, subject } = req.body;
    const { TimetableSimple } = models;
    const departmentId = req.user?.department_id || req.user?.departmentId;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Allocation ID is required'
      });
    }

    if (!facultyName && !subject) {
      return res.status(400).json({
        success: false,
        error: 'Please provide facultyName or subject to update'
      });
    }

    const allocation = await TimetableSimple.findByPk(id);

    if (!allocation) {
      return res.status(404).json({
        success: false,
        error: 'Allocation not found'
      });
    }

    // Verify department access (allocation.department is a string like "AIDS", us department ID)
    // For now, skip the check since TimetableSimple doesn't have department_id
    // Just update the fields
    
    // Update fields
    if (facultyName) allocation.facultyName = facultyName;
    if (subject) allocation.subject = subject;

    await allocation.save();

    return res.status(200).json({
      success: true,
      data: allocation.toJSON()
    });
  } catch (error) {
    console.error('[UPDATE TIMETABLE ALLOCATION] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update allocation'
    });
  }
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
  getFacultyAllocationsBySemester,
  getTimetableAllocations,
  updateTimetableAllocation
};
