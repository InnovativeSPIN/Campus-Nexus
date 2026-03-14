import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const { SubjectClassMapping, Subject, Class, Department } = models;

// @desc      Get all subject-class mappings for a department
// @route     GET /api/v1/department-admin/subject-class-mappings
// @access    Private/DepartmentAdmin
export const getMappings = asyncHandler(async (req, res, next) => {
  const { semester, academic_year } = req.query;
  const departmentId = req.user?.department_id;

  if (!departmentId) {
    return next(new ErrorResponse('Department ID not found in user', 400));
  }

  const where = { department_id: departmentId };

  if (semester && semester !== 'undefined' && semester !== 'null') {
    const semNumber = parseInt(semester);
    if (!Number.isNaN(semNumber)) {
      where.semester = semNumber;
    }
  }

  if (academic_year && academic_year !== 'undefined' && academic_year !== 'null') {
    // Allow partial year input (e.g. "2025") to match "2025-2026"
    if (academic_year.includes('-')) {
      where.academic_year = academic_year;
    } else {
      where.academic_year = { [Op.like]: `${academic_year}%` };
    }
  }

  console.log('[GET MAPPINGS] where', where);

  const mappings = await SubjectClassMapping.findAll({
    where,
    include: [
      {
        model: Subject,
        as: 'subject',
        attributes: ['id', 'subject_name', 'subject_code', 'credits']
      },
      {
        model: Class,
        as: 'class',
        attributes: ['id', 'name', 'semester']
      },
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'short_name', 'full_name']
      }
    ],
    order: [['semester', 'ASC'], ['academic_year', 'DESC']]
  });

  // Transform response to match frontend expectations
  const transformedMappings = mappings.map(mapping => {
    const data = mapping.toJSON();
    if (data.subject) {
      data.subject = {
        id: data.subject.id,
        name: data.subject.subject_name,
        code: data.subject.subject_code,
        credits: data.subject.credits
      };
    }
    return data;
  });

  res.status(200).json({
    success: true,
    count: transformedMappings.length,
    data: transformedMappings
  });
});

// @desc      Get single subject-class mapping
// @route     GET /api/v1/department-admin/subject-class-mappings/:id
// @access    Private/DepartmentAdmin
export const getMapping = asyncHandler(async (req, res, next) => {
  const mapping = await SubjectClassMapping.findByPk(req.params.id, {
    include: [
      {
        model: Subject,
        as: 'subject',
        attributes: ['id', 'subject_name', 'subject_code', 'credits']
      },
      {
        model: Class,
        as: 'class',
        attributes: ['id', 'name', 'semester']
      }
    ]
  });

  if (!mapping) {
    return next(new ErrorResponse(`Mapping not found with id of ${req.params.id}`, 404));
  }

  if (mapping.department_id !== req.user.department_id) {
    return next(new ErrorResponse('Not authorized to access this mapping', 403));
  }

  // Transform response to match frontend expectations
  const data = mapping.toJSON();
  if (data.subject) {
    data.subject = {
      id: data.subject.id,
      name: data.subject.subject_name,
      code: data.subject.subject_code,
      credits: data.subject.credits
    };
  }

  res.status(200).json({
    success: true,
    data
  });
});

// @desc      Create subject-class mapping
// @route     POST /api/v1/department-admin/subject-class-mappings
// @access    Private/DepartmentAdmin
export const createMapping = asyncHandler(async (req, res, next) => {
  const { subject_id, class_id, semester, academic_year, is_core, status } = req.body;
  const departmentId = req.user.department_id;

  // Validate required fields
  if (!subject_id || !class_id || !semester || !academic_year) {
    return next(new ErrorResponse('Subject ID, Class ID, Semester, and Academic Year are required', 400));
  }

  // Verify subject belongs to department
  const subject = await Subject.findByPk(subject_id);
  if (!subject || subject.department_id !== departmentId) {
    return next(new ErrorResponse('Subject not found or does not belong to your department', 404));
  }

  // Verify class belongs to department
  const classRecord = await Class.findByPk(class_id);
  if (!classRecord || classRecord.department_id !== departmentId) {
    return next(new ErrorResponse('Class not found or does not belong to your department', 404));
  }

  // Check if mapping already exists
  const existingMapping = await SubjectClassMapping.findOne({
    where: {
      subject_id,
      class_id,
      semester,
      academic_year,
      department_id: departmentId
    }
  });

  if (existingMapping) {
    return next(new ErrorResponse('This subject-class mapping already exists for this semester and academic year', 409));
  }

  const mapping = await SubjectClassMapping.create({
    subject_id,
    class_id,
    department_id: departmentId,
    semester,
    academic_year,
    is_core: is_core !== undefined ? is_core : true,
    status: status || 'active'
  });

  const createdMapping = await SubjectClassMapping.findByPk(mapping.id, {
    include: [
      {
        model: Subject,
        as: 'subject',
        attributes: ['id', 'subject_name', 'subject_code', 'credits']
      },
      {
        model: Class,
        as: 'class',
        attributes: ['id', 'name', 'semester']
      }
    ]
  });

  // Transform response to match frontend expectations
  const responseData = createdMapping.toJSON();
  if (responseData.subject) {
    responseData.subject = {
      id: responseData.subject.id,
      name: responseData.subject.subject_name,
      code: responseData.subject.subject_code,
      credits: responseData.subject.credits
    };
  }

  res.status(201).json({
    success: true,
    data: responseData
  });
});

// @desc      Update subject-class mapping
// @route     PUT /api/v1/department-admin/subject-class-mappings/:id
// @access    Private/DepartmentAdmin
export const updateMapping = asyncHandler(async (req, res, next) => {
  const { is_core, status } = req.body;

  const mapping = await SubjectClassMapping.findByPk(req.params.id);

  if (!mapping) {
    return next(new ErrorResponse(`Mapping not found with id of ${req.params.id}`, 404));
  }

  if (mapping.department_id !== req.user.department_id) {
    return next(new ErrorResponse('Not authorized to update this mapping', 403));
  }

  const updatedMapping = await mapping.update({
    is_core: is_core !== undefined ? is_core : mapping.is_core,
    status: status || mapping.status
  });

  res.status(200).json({
    success: true,
    data: updatedMapping
  });
});

// @desc      Delete subject-class mapping
// @route     DELETE /api/v1/department-admin/subject-class-mappings/:id
// @access    Private/DepartmentAdmin
export const deleteMapping = asyncHandler(async (req, res, next) => {
  const mapping = await SubjectClassMapping.findByPk(req.params.id);

  if (!mapping) {
    return next(new ErrorResponse(`Mapping not found with id of ${req.params.id}`, 404));
  }

  if (mapping.department_id !== req.user.department_id) {
    return next(new ErrorResponse('Not authorized to delete this mapping', 403));
  }

  await mapping.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get unmapped subjects for a class
// @route     GET /api/v1/department-admin/subject-class-mappings/unmapped/subjects/:classId
// @access    Private/DepartmentAdmin
export const getUnmappedSubjects = asyncHandler(async (req, res, next) => {
  const { classId } = req.params;
  const { semester, academic_year } = req.query;
  const departmentId = req.user.department_id;

  // Build where clause for subjects
  const subjectWhere = { department_id: departmentId };
  if (semester) {
    subjectWhere.semester = parseInt(semester);
  }

  // Get all subjects for the department and semester
  const allSubjects = await Subject.findAll({
    where: subjectWhere,
    attributes: ['id', 'subject_code', 'subject_name']
  });

  // Get already mapped subjects
  const mappingWhere = {
    class_id: classId,
    department_id: departmentId
  };
  if (semester) {
    mappingWhere.semester = parseInt(semester);
  }
  if (academic_year) {
    mappingWhere.academic_year = academic_year;
  }

  const mappedSubjects = await SubjectClassMapping.findAll({
    where: mappingWhere,
    attributes: ['subject_id']
  });

  const mappedSubjectIds = mappedSubjects.map(m => m.subject_id);

  // Filter unmapped subjects and transform
  const unmappedSubjects = allSubjects
    .filter(s => !mappedSubjectIds.includes(s.id))
    .map(subject => ({
      id: subject.id,
      code: subject.subject_code,
      name: subject.subject_name
    }));

  res.status(200).json({
    success: true,
    count: unmappedSubjects.length,
    data: unmappedSubjects
  });
});
