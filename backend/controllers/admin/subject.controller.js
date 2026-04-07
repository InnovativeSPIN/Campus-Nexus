import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const { Subject, Department, Class, Student } = models;

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
        academic_year: subject.academic_year,
        year: subject.year,
        batch: subject.batch,
        lab_name: subject.lab_name,
        credits: subject.credits,
        type: subject.type,
        subject_category: subject.subject_category,
        is_elective: subject.is_elective,
        is_laboratory: subject.is_laboratory,
        available_to_all_departments: subject.available_to_all_departments,
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
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
        { model: Class, as: 'class', attributes: ['id', 'name'] }
      ]
    });

    if (!subject) {
      return next(new ErrorResponse(`Subject not found with id of ${req.params.id}`, 404));
    }

    // Format response with proper field names
    const subjectData = subject.toJSON();
    const result = {
      id: subjectData.id,
      code: subjectData.subject_code,
      name: subjectData.subject_name,
      description: subjectData.description,
      department_id: subjectData.department_id,
      department: subjectData.department,
      semester: subjectData.semester,
      sem_type: subjectData.sem_type,
      credits: subjectData.credits,
      type: subjectData.type,
      subject_category: subjectData.subject_category,
      is_elective: subjectData.is_elective,
      is_laboratory: subjectData.is_laboratory,
      available_to_all_departments: subjectData.available_to_all_departments,
      batch: subjectData.batch,
      status: subjectData.status,
      created_at: subjectData.created_at,
      updated_at: subjectData.updated_at,
      class: subjectData.class
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getSubject:', error);
    return next(new ErrorResponse(error.message || 'Error fetching subject', 500));
  }
});

// @desc      Create subject
// @route     POST /api/v1/admin/subjects
// @access    Private/SuperAdmin
export const createSubject = asyncHandler(async (req, res, next) => {
  try {
    const {
      code,
      name,
      description,
      department_id,
      semester,
      sem_type,
      academic_year,
      year,
      batch,
      lab_name,
      credits,
      type,
      is_elective,
      is_laboratory,
      available_to_all_departments,
      class_id,
      max_students,
      status,
      subject_category
    } = req.body;

    console.log('📌 CREATE SUBJECT - Received payload:', {
      code, name, department_id, available_to_all_departments,
      credits, type, subject_category, is_elective, is_laboratory
    });

    // Validate required fields
    if (!code || !name) {
      return next(new ErrorResponse('Please provide code and name', 400));
    }

    // Department is required if NOT assigning to all departments
    const deptId = department_id ? parseInt(department_id) : null;
    if (!available_to_all_departments && (!deptId || isNaN(deptId))) {
      return next(new ErrorResponse('Please provide a valid department_id or set available_to_all_departments to true', 400));
    }

    // Check if subject already exists
    let existingSubject;
    if (available_to_all_departments) {
      // For all-departments subjects, check if code + name already exists with same flag
      existingSubject = await Subject.findOne({ 
        where: { 
          subject_code: code,
          subject_name: name,
          available_to_all_departments: true
        } 
      });
      if (existingSubject) {
        return next(new ErrorResponse(`Subject "${code} - ${name}" (all departments) already exists`, 400));
      }
    } else {
      // For department-specific subjects, check code + name + department combo
      existingSubject = await Subject.findOne({ 
        where: { 
          subject_code: code,
          subject_name: name,
          department_id: deptId
        } 
      });
      if (existingSubject) {
        return next(new ErrorResponse(`Subject "${code} - ${name}" already exists in this department`, 400));
      }
    }

    // Validate semester is 1-8 if provided
    if (semester && (semester < 1 || semester > 8)) {
      return next(new ErrorResponse('Semester must be between 1 and 8', 400));
    }

    // Validate sem_type is odd or even if provided
    if (sem_type && !['odd', 'even'].includes(sem_type)) {
      return next(new ErrorResponse('Semester type must be either "odd" or "even"', 400));
    }

    const subject = await Subject.create({
      subject_code: code,
      subject_name: name,
      description: description || null,
      department_id: available_to_all_departments ? null : deptId,
      semester: semester ? parseInt(semester) : 1,
      sem_type: sem_type || (semester && parseInt(semester) % 2 === 1 ? 'odd' : 'even'),
      academic_year: academic_year || null,
      year: year ? parseInt(year) : (semester ? Math.ceil(parseInt(semester) / 2) : null),
      batch: batch || null,
      lab_name: is_laboratory ? (lab_name || null) : null,
      credits: credits ? parseFloat(credits) : 4.0,
      type: type || 'Theory',
      subject_category: subject_category || 'academic',
      is_elective: is_elective || false,
      is_laboratory: is_laboratory || false,
      available_to_all_departments: available_to_all_departments || false,
      class_id: class_id || null,
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
    console.log('✅ Subject created successfully:', code);
    
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
        academic_year: formatted.academic_year,
        year: formatted.year,
        batch: formatted.batch,
        lab_name: formatted.lab_name,
        credits: formatted.credits,
        type: formatted.type,
        subject_category: formatted.subject_category,
        is_elective: formatted.is_elective,
        is_laboratory: formatted.is_laboratory,
        available_to_all_departments: formatted.available_to_all_departments,
        status: formatted.status,
        created_at: formatted.created_at,
        updated_at: formatted.updated_at
      }
    });
  } catch (error) {
    console.error('❌ Error in createSubject:', error.message);
    return next(new ErrorResponse(error.message || 'Failed to create subject', 500));
  }
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
    department_id,
    semester,
    sem_type,
    academic_year,
    year,
    batch,
    lab_name,
    credits,
    type,
    subject_category,
    is_elective,
    is_laboratory,
    available_to_all_departments,
    class_id,
    min_hours_per_week,
    max_students,
    status
  } = req.body;

  // If code or name is being changed, check for duplicates (same department + code + name)
  if ((code && code !== subject.subject_code) || (name && name !== subject.subject_name)) {
    const checkCode = code || subject.subject_code;
    const checkName = name || subject.subject_name;
    const existingSubject = await Subject.findOne({ 
      where: { 
        subject_code: checkCode,
        subject_name: checkName,
        department_id: subject.department_id,
        id: { [Op.ne]: req.params.id } // Exclude current subject
      } 
    });
    if (existingSubject) {
      return next(new ErrorResponse(`Subject "${checkCode} - ${checkName}" already exists in this department`, 400));
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

  // Update subject - use database column names
  subject = await subject.update({
    subject_code: code || subject.subject_code,
    subject_name: name || subject.subject_name,
    description: description !== undefined ? description : subject.description,
    department_id: available_to_all_departments ? null : (department_id !== undefined ? parseInt(department_id) : subject.department_id),
    semester: semester !== undefined ? (semester ? parseInt(semester) : 1) : subject.semester,
    sem_type: sem_type || subject.sem_type,
    academic_year: academic_year !== undefined ? academic_year : subject.academic_year,
    year: year !== undefined ? parseInt(year) : subject.year,
    batch: batch !== undefined ? batch : subject.batch,
    lab_name: is_laboratory !== undefined
      ? (is_laboratory ? (lab_name || subject.lab_name) : null)
      : (subject.is_laboratory ? (lab_name !== undefined ? lab_name : subject.lab_name) : null),
    credits: credits !== undefined ? parseFloat(credits) : subject.credits,
    type: type || subject.type,
    subject_category: subject_category || subject.subject_category,
    is_elective: is_elective !== undefined ? is_elective : subject.is_elective,
    is_laboratory: is_laboratory !== undefined ? is_laboratory : subject.is_laboratory,
    available_to_all_departments: available_to_all_departments !== undefined ? available_to_all_departments : subject.available_to_all_departments,
    available_to_all_departments: available_to_all_departments !== undefined ? available_to_all_departments : subject.available_to_all_departments,
    class_id: class_id !== undefined ? class_id : subject.class_id,
    min_hours_per_week: min_hours_per_week || subject.min_hours_per_week,
    max_students: max_students || subject.max_students,
    status: status || subject.status
  });

  // Reload with associations
  const updatedSubject = await Subject.findByPk(subject.id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] }
    ]
  });

  // Format response with proper field names
  const subjectData = updatedSubject.toJSON();
  const result = {
    id: subjectData.id,
    code: subjectData.subject_code,
    name: subjectData.subject_name,
    description: subjectData.description,
    department_id: subjectData.department_id,
    department: subjectData.department,
    semester: subjectData.semester,
    sem_type: subjectData.sem_type,
    academic_year: subjectData.academic_year,
    year: subjectData.year,
    batch: subjectData.batch,
    lab_name: subjectData.lab_name,
    credits: subjectData.credits,
    type: subjectData.type,
    subject_category: subjectData.subject_category,
    is_elective: subjectData.is_elective,
    is_laboratory: subjectData.is_laboratory,
    status: subjectData.status,
    created_at: subjectData.created_at,
    updated_at: subjectData.updated_at
  };

  res.status(200).json({
    success: true,
    data: result
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

    const batches = await Student.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('batch')), 'batch']],
      where: {
        batch: { [Op.ne]: null }
      },
      order: [[sequelize.col('batch'), 'ASC']]
    });

    const batchList = batches.map(b => b.get('batch')).filter(Boolean);

    res.status(200).json({
      success: true,
      data: departments.map(d => ({
        id: d.id,
        short_name: d.short_name,
        full_name: d.full_name
      })),
      semesters: Array.from({ length: 8 }, (_, i) => i + 1),
      semTypes: ['odd', 'even'],
      subjectTypes: ['Theory', 'Practical', 'Theory+Practical', 'Project', 'Seminar', 'Internship'],
      batches: batchList
    });
  } catch (error) {
    console.error('Error in getDepartmentsSemesters:', error);
    return next(new ErrorResponse(error.message || 'Error fetching departments', 500));
  }
});

// @desc      Bulk upload subjects
// @route     POST /api/v1/admin/subjects/bulk
// @access    Private/SuperAdmin
export const bulkUploadSubjects = asyncHandler(async (req, res, next) => {
  try {
    const { subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return next(new ErrorResponse('Please provide an array of subjects to upload', 400));
    }

    const results = {
      successful: [],
      failed: [],
      total: subjects.length
    };

    for (let i = 0; i < subjects.length; i++) {
      const subjectData = subjects[i];
      const rowNumber = i + 1; // For error reporting

      try {
        // Validate required fields
        const { code, name, description, department_id, semester, sem_type, academic_year, year, lab_name, credits, type, is_elective, is_laboratory, status } = subjectData;

        if (!code || !name || !department_id) {
          throw new Error('Missing required fields: code, name, department_id');
        }

        // Check if code + name + department already exists
        const existingSubject = await Subject.findOne({ 
          where: { 
            subject_code: code,
            subject_name: name,
            department_id: parseInt(department_id)
          } 
        });
        if (existingSubject) {
          throw new Error(`Subject "${code} - ${name}" already exists in this department`);
        }

        // Validate semester if provided
        if (semester) {
          const semesterNum = parseInt(semester);
          if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
            throw new Error('Semester must be a number between 1 and 8');
          }
        }

        // Validate sem_type if provided
        if (sem_type && !['odd', 'even'].includes(String(sem_type).toLowerCase())) {
          throw new Error('Semester type must be either "odd" or "even"');
        }

        // Create subject
        const semesterNum = semester ? parseInt(semester) : null;
        const newSubject = await Subject.create({
          subject_code: code,
          subject_name: name,
          description: description || null,
          department_id: parseInt(department_id),
          semester: semesterNum,
          sem_type: sem_type || (semesterNum && semesterNum % 2 === 1 ? 'odd' : 'even'),
          academic_year: academic_year || null,
          year: year ? parseInt(year) : (semesterNum ? Math.ceil(semesterNum / 2) : null),
          lab_name: is_laboratory ? (lab_name || null) : null,
          credits: credits ? parseFloat(credits) : 4.0,
          type: type || 'Theory',
          is_elective: is_elective ? true : false,
          is_laboratory: is_laboratory ? true : false,
          status: status || 'active',
          created_by: req.user?.id || 1
        });

        // Reload with associations
        const createdSubject = await Subject.findByPk(newSubject.id, {
          include: [
            { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] }
          ]
        });

        results.successful.push({
          row: rowNumber,
          code: code,
          name: name,
          message: 'Subject created successfully'
        });
      } catch (error) {
        results.failed.push({
          row: rowNumber,
          code: subjectData.code || 'N/A',
          error: error.message
        });
      }
    }

    res.status(207).json({
      success: true,
      message: `Bulk upload completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    return next(new ErrorResponse(error.message || 'Error in bulk upload', 500));
  }
});

export default {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByDepartmentAndSemester,
  getDepartmentsSemesters,
  bulkUploadSubjects
};
