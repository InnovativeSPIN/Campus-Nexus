import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { ClassIncharge, Class: ClassModel, Faculty, Student, Department } = models;

// @desc      Assign faculty as class incharge
// @route     POST /api/v1/department-admin/class-incharges
// @access    Private/DepartmentAdmin
export const assignClassIncharge = asyncHandler(async (req, res, next) => {
  const { class_id, faculty_id, academic_year } = req.body;
  const departmentId = req.user.department_id;

  if (!class_id || !faculty_id || !academic_year) {
    return next(new ErrorResponse('Please provide class_id, faculty_id, and academic_year', 400));
  }

  // Verify class belongs to department
  const classExists = await ClassModel.findOne({
    where: { id: class_id, department_id: departmentId }
  });

  if (!classExists) {
    return next(new ErrorResponse('Class not found in your department', 404));
  }

  // Verify faculty belongs to department
  const faculty = await Faculty.findOne({
    where: { faculty_id, department_id: departmentId }
  });

  if (!faculty) {
    return next(new ErrorResponse('Faculty not found in your department', 404));
  }

  // Check if incharge already exists
  const existingIncharge = await ClassIncharge.findOne({
    where: { class_id, academic_year }
  });

  if (existingIncharge) {
    // Update existing incharge
    await existingIncharge.update({
      faculty_id,
      assigned_by: req.user.id,
      assigned_at: new Date(),
      status: 'active'
    });

    const updatedIncharge = await ClassIncharge.findByPk(existingIncharge.id, {
      include: [
        { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch'] },
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Class incharge updated successfully',
      data: updatedIncharge
    });
  }

  // Create new incharge
  const incharge = await ClassIncharge.create({
    class_id,
    faculty_id,
    academic_year,
    assigned_by: req.user.id,
    status: 'active'
  });

  // Reload with associations
  const createdIncharge = await ClassIncharge.findByPk(incharge.id, {
    include: [
      { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch', 'capacity'] },
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Class incharge assigned successfully',
    data: createdIncharge
  });
});

// @desc      Get class incharges for department
// @route     GET /api/v1/department-admin/class-incharges
// @access    Private/DepartmentAdmin
export const getClassIncharges = asyncHandler(async (req, res, next) => {
  const { academic_year, semester, status } = req.query;
  const departmentId = req.user.department_id;

  const where = { status: 'active' };
  if (academic_year) where.academic_year = academic_year;
  if (status) where.status = status;

  // Get classes for this department
  const classes = await ClassModel.findAll({
    where: { department_id: departmentId },
    attributes: ['id']
  });

  const classIds = classes.map(c => c.id);

  if (classIds.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }

  where.class_id = { [Op.in]: classIds };
  if (semester) {
    where['$class.semester$'] = parseInt(semester);
  }

  const incharges = await ClassIncharge.findAll({
    where,
    include: [
      { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch', 'capacity'] },
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] }
    ],
    order: [['academic_year', 'DESC'], ['$class.semester$', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: incharges.length,
    data: incharges
  });
});

// @desc      Get class incharge by ID
// @route     GET /api/v1/department-admin/class-incharges/:id
// @access    Private/DepartmentAdmin
export const getClassInchargeById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const incharge = await ClassIncharge.findByPk(id, {
    include: [
      { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch', 'capacity', 'department_id'] },
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation', 'department_id'] }
    ]
  });

  if (!incharge) {
    return next(new ErrorResponse('Class incharge not found', 404));
  }

  // Verify department access
  if (incharge.class.department_id !== departmentId) {
    return next(new ErrorResponse('Unauthorized', 403));
  }

  res.status(200).json({
    success: true,
    data: incharge
  });
});

// @desc      Get students for a class (via class incharge)
// @route     GET /api/v1/department-admin/class-incharges/:id/students
// @access    Private/DepartmentAdmin
export const getClassInchargeStudents = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;
  const { search, status: studentStatus } = req.query;

  const incharge = await ClassIncharge.findByPk(id);

  if (!incharge) {
    return next(new ErrorResponse('Class incharge not found', 404));
  }

  // Verify class belongs to department
  const classObj = await ClassModel.findOne({
    where: { id: incharge.class_id, department_id: departmentId }
  });

  if (!classObj) {
    return next(new ErrorResponse('Unauthorized', 403));
  }

  // Find students in this class
  const where = { classId: incharge.class_id };
  if (studentStatus) where.status = studentStatus;

  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { studentId: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const students = await Student.findAll({
    where,
    attributes: ['id', 'studentId', 'firstName', 'lastName', 'email', 'phone', 'status', 'classId', 'semester'],
    order: [['studentId', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: students.length,
    data: {
      incharge: {
        id: incharge.id,
        class: classObj.toJSON(),
        faculty: (await Faculty.findByPk(incharge.faculty_id, {
          attributes: ['faculty_id', 'Name', 'email', 'designation']
        })).toJSON(),
        academicYear: incharge.academic_year
      },
      students
    }
  });
});

// @desc      Update class incharge
// @route     PUT /api/v1/department-admin/class-incharges/:id
// @access    Private/DepartmentAdmin
export const updateClassIncharge = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { faculty_id, status } = req.body;
  const departmentId = req.user.department_id;

  const incharge = await ClassIncharge.findByPk(id);

  if (!incharge) {
    return next(new ErrorResponse('Class incharge not found', 404));
  }

  // Verify department access
  const classObj = await ClassModel.findOne({
    where: { id: incharge.class_id, department_id: departmentId }
  });

  if (!classObj) {
    return next(new ErrorResponse('Unauthorized', 403));
  }

  // If faculty_id is being changed, verify it exists
  if (faculty_id) {
    const faculty = await Faculty.findOne({
      where: { faculty_id, department_id: departmentId }
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty not found in your department', 404));
    }
  }

  await incharge.update({
    faculty_id: faculty_id || incharge.faculty_id,
    status: status || incharge.status
  });

  // Reload with associations
  const updatedIncharge = await ClassIncharge.findByPk(id, {
    include: [
      { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section', 'semester', 'batch'] },
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'designation'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Class incharge updated successfully',
    data: updatedIncharge
  });
});

// @desc      Delete class incharge
// @route     DELETE /api/v1/department-admin/class-incharges/:id
// @access    Private/DepartmentAdmin
export const deleteClassIncharge = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;

  const incharge = await ClassIncharge.findByPk(id);

  if (!incharge) {
    return next(new ErrorResponse('Class incharge not found', 404));
  }

  // Verify department access
  const classObj = await ClassModel.findOne({
    where: { id: incharge.class_id, department_id: departmentId }
  });

  if (!classObj) {
    return next(new ErrorResponse('Unauthorized', 403));
  }

  // Soft delete by marking as inactive
  await incharge.update({ status: 'inactive' });

  res.status(200).json({
    success: true,
    message: 'Class incharge removed successfully',
    data: {}
  });
});

export default {
  assignClassIncharge,
  getClassIncharges,
  getClassInchargeById,
  getClassInchargeStudents,
  updateClassIncharge,
  deleteClassIncharge
};
