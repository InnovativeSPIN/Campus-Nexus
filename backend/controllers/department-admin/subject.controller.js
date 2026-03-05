import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const { Subject, Department, Faculty, FacultySubjectAssignment, User } = models;

// @route   GET /api/v1/department-admin/subjects
// @desc    Get all subjects for the department
// @access  Private (Department Admin)
export const getDepartmentSubjects = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  const { semester, status, academic_year } = req.query;

  const where = { department_id: departmentId };
  
  if (semester) where.semester = semester;
  if (status) where.status = status;

  const includeOptions = [
    {
      model: Department,
      as: 'department',
      attributes: ['id', 'short_name', 'full_name']
    },
    {
      model: Faculty,
      as: 'assignedFaculty',
      attributes: ['faculty_id', 'Name', 'email', 'designation'],
      through: { 
        attributes: ['academic_year', 'status', 'assigned_at', 'semester'],
        where: academic_year ? { academic_year } : {}
      }
    }
  ];

  const subjects = await Subject.findAll({
    where,
    include: includeOptions,
    order: [['semester', 'ASC'], ['subject_name', 'ASC']]
  });

  // Transform response to match frontend expectations
  const transformedSubjects = subjects.map(subject => {
    const obj = subject.toJSON();
    return {
      ...obj,
      name: obj.subject_name,
      code: obj.subject_code
    };
  });

  res.status(200).json({
    success: true,
    count: transformedSubjects.length,
    data: transformedSubjects
  });
});

// @route   GET /api/v1/department-admin/subjects/:id
// @desc    Get single subject details
// @access  Private (Department Admin)
export const getSubjectDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const subject = await Subject.findOne({
    where: { id, department_id: departmentId },
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      },
      {
        model: Faculty,
        as: 'assignedFaculty',
        attributes: ['faculty_id', 'Name', 'email', 'designation', 'department_id'],
        through: { 
          attributes: ['academic_year', 'status', 'assigned_at', 'semester', 'total_hours', 'no_of_periods']
        }
      }
    ]
  });

  if (!subject) {
    return next(new ErrorResponse('Subject not found', 404));
  }

  // Transform response to match frontend expectations
  const subjectData = subject.toJSON();
  const transformedSubject = {
    ...subjectData,
    name: subjectData.subject_name,
    code: subjectData.subject_code
  };

  res.status(200).json({
    success: true,
    data: transformedSubject
  });
});

// @route   POST /api/v1/department-admin/subjects
// @desc    Create new subject
// @access  Private (Department Admin)
export const createSubject = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  
  // Map frontend field names to database field names
  const { name, code, ...restData } = req.body;
  const subjectData = {
    subject_name: name,
    subject_code: code,
    department_id: departmentId,
    ...restData
  };

  // Check if subject code already exists in department
  const existingSubject = await Subject.findOne({
    where: { 
      subject_code: code,
      department_id: departmentId 
    }
  });

  if (existingSubject) {
    return next(new ErrorResponse('Subject with this code already exists in your department', 400));
  }

  const subject = await Subject.create(subjectData);

  // Fetch the created subject with associations
  const createdSubject = await Subject.findByPk(subject.id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ]
  });

  // Transform response
  const subjData = createdSubject.toJSON();
  const transformedSubject = {
    ...subjData,
    name: subjData.subject_name,
    code: subjData.subject_code
  };

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: transformedSubject
  });
});

// @route   PUT /api/v1/department-admin/subjects/:id
// @desc    Update subject
// @access  Private (Department Admin)
export const updateSubject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  let subject = await Subject.findOne({
    where: { id, department_id: departmentId }
  });

  if (!subject) {
    return next(new ErrorResponse('Subject not found', 404));
  }

  // Map frontend field names to database field names
  const { name, code, ...restData } = req.body;
  const updateData = { ...restData };
  if (name) updateData.subject_name = name;
  if (code) updateData.subject_code = code;

  // Check if subject code is being changed and if it conflicts
  if (code && code !== subject.subject_code) {
    const existingSubject = await Subject.findOne({
      where: { 
        subject_code: code,
        department_id: departmentId,
        id: { [models.Sequelize.Op.ne]: id } // Exclude current subject
      }
    });

    if (existingSubject) {
      return next(new ErrorResponse('Subject with this code already exists in your department', 400));
    }
  }

  await subject.update(updateData);

  // Fetch updated subject with associations
  const updatedSubject = await Subject.findByPk(id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      },
      {
        model: Faculty,
        as: 'assignedFaculty',
        attributes: ['faculty_id', 'Name', 'email', 'designation'],
        through: { attributes: ['academic_year', 'status', 'assigned_at', 'semester'] }
      }
    ]
  });

  // Transform response
  const subjData = updatedSubject.toJSON();
  const transformedSubject = {
    ...subjData,
    name: subjData.subject_name,
    code: subjData.subject_code
  };

  res.status(200).json({
    success: true,
    message: 'Subject updated successfully',
    data: transformedSubject
  });
});

// @route   DELETE /api/v1/department-admin/subjects/:id
// @desc    Delete subject
// @access  Private (Department Admin)
export const deleteSubject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const subject = await Subject.findOne({
    where: { id, department_id: departmentId }
  });

  if (!subject) {
    return next(new ErrorResponse('Subject not found', 404));
  }

  // Check if subject has any active assignments
  const activeAssignments = await FacultySubjectAssignment.count({
    where: { 
      subject_id: id,
      status: 'active'
    }
  });

  if (activeAssignments > 0) {
    return next(new ErrorResponse('Cannot delete subject with active faculty assignments. Please remove assignments first.', 400));
  }

  await subject.destroy();

  res.status(200).json({
    success: true,
    message: 'Subject deleted successfully',
    data: {}
  });
});

// @route   POST /api/v1/department-admin/subjects/:id/assign-faculty
// @desc    Assign faculty to subject
// @access  Private (Department Admin)
export const assignFacultyToSubject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { faculty_id, academic_year, semester } = req.body;
  const departmentId = req.user.department_id;

  // Verify subject exists and belongs to department
  const subject = await Subject.findOne({
    where: { id, department_id: departmentId }
  });

  if (!subject) {
    return next(new ErrorResponse('Subject not found', 404));
  }

  // Verify faculty exists and belongs to department
  const faculty = await Faculty.findOne({
    where: { 
      faculty_id,
      department_id: departmentId 
    }
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found in your department', 404));
  }

  // Check if assignment already exists
  const existingAssignment = await FacultySubjectAssignment.findOne({
    where: {
      faculty_id,
      subject_id: id,
      academic_year
    }
  });

  if (existingAssignment) {
    if (existingAssignment.status === 'active') {
      return next(new ErrorResponse('Faculty is already assigned to this subject for this academic year', 400));
    } else {
      // Reactivate inactive assignment
      await existingAssignment.update({
        status: 'active',
        semester,
        assigned_by: req.user.id,
        assigned_at: new Date()
      });
    }
  } else {
    // Create new assignment
    await FacultySubjectAssignment.create({
      faculty_id,
      subject_id: id,
      academic_year,
      semester,
      assigned_by: req.user.id
    });
  }

  // Fetch updated subject with assignments
  const updatedSubject = await Subject.findByPk(id, {
    include: [
      {
        model: Faculty,
        as: 'assignedFaculty',
        attributes: ['faculty_id', 'Name', 'email', 'designation', 'department_id'],
        through: { attributes: ['academic_year', 'status', 'assigned_at', 'semester', 'total_hours', 'no_of_periods'] }
      }
    ]
  });

  // Transform response
  const subjData = updatedSubject.toJSON();
  const transformedSubject = {
    ...subjData,
    name: subjData.subject_name,
    code: subjData.subject_code
  };

  res.status(200).json({
    success: true,
    message: `Faculty ${faculty.Name} assigned to ${subject.subject_name} successfully`,
    data: transformedSubject
  });
});

// @route   DELETE /api/v1/department-admin/subjects/:id/assignments/:assignment_id
// @desc    Remove faculty assignment from subject
// @access  Private (Department Admin)
export const removeFacultyAssignment = asyncHandler(async (req, res, next) => {
  const { id, assignment_id } = req.params;
  const departmentId = req.user.department_id;

  // Verify subject belongs to department
  const subject = await Subject.findOne({
    where: { id, department_id: departmentId }
  });

  if (!subject) {
    return next(new ErrorResponse('Subject not found', 404));
  }

  // Find and remove the assignment
  const assignment = await FacultySubjectAssignment.findOne({
    where: { 
      id: assignment_id,
      subject_id: id 
    },
    include: [
      {
        model: Faculty,
        as: 'faculty',
        where: { department_id: departmentId },
        attributes: ['faculty_id', 'Name']
      }
    ]
  });

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  await assignment.update({ status: 'inactive' });

  res.status(200).json({
    success: true,
    message: `Faculty assignment removed successfully`,
    data: {}
  });
});

// @route   GET /api/v1/department-admin/subjects/available-faculty
// @desc    Get available faculty for subject assignment
// @access  Private (Department Admin)
export const getAvailableFaculty = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  const { subject_id, academic_year } = req.query;

  let excludeIds = [];

  // If checking for a specific subject, exclude already assigned faculty
  if (subject_id && academic_year) {
    const assignments = await FacultySubjectAssignment.findAll({
      where: {
        subject_id,
        academic_year,
        status: 'active'
      },
      attributes: ['faculty_id']
    });
    excludeIds = assignments.map(a => a.faculty_id);
  }

  const where = { 
    department_id: departmentId,
    status: 'active'
  };
  
  if (excludeIds.length > 0) {
    where.faculty_id = { [models.Sequelize.Op.notIn]: excludeIds };
  }

  const faculty = await Faculty.findAll({
    where,
    attributes: ['faculty_id', 'Name', 'email', 'designation'],
    order: [['Name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: faculty.length,
    data: faculty
  });
});