import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Faculty, User } = models;
// additional models imported from models index
const { Department, Subject, Class: ClassModel } = models;
import { Op } from 'sequelize';

// @desc      Get all faculty
// @route     GET /api/v1/faculty
// @access    Private
export const getAllFaculty = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let where = {};

  // Filter by department
  if (req.query.department) {
    where.departmentId = req.query.department;
  }

  // Filter by status
  if (req.query.status) {
    where.status = req.query.status;
  }

  // Filter by designation
  if (req.query.designation) {
    where.designation = req.query.designation;
  }

  // Search by full name or employee code or email
  if (req.query.search) {
    where[Op.or] = [
      { Name: { [Op.like]: `%${req.query.search}%` } },
      { faculty_college_code: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  const total = await Faculty.count({ where });
  const faculty = await Faculty.findAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
    ],
    offset: startIndex,
    limit,
    order: [['created_at', 'DESC']]
  });

  // transform to match frontend shape
  const facultyData = faculty.map((f) => {
    const obj = f.toJSON();
    // copy full name into firstName/lastName slots
    obj.firstName = obj.Name || '';
    obj.lastName = '';
    if (obj.department) {
      obj.department.name = obj.department.short_name || obj.department.full_name;
    }
    return obj;
  });

  res.status(200).json({
    success: true,
    count: facultyData.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: facultyData
  });
});

// @desc      Get single faculty
// @route     GET /api/v1/faculty/:id
// @access    Private
export const getFaculty = asyncHandler(async (req, res, next) => {
  let faculty = await Faculty.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
      { model: ClassModel, as: 'assignedClasses' }
    ]
  });

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  const obj = faculty.toJSON();
  obj.firstName = obj.Name || '';
  obj.lastName = '';
  if (obj.department) {
    obj.department.name = obj.department.short_name || obj.department.full_name;
  }

  res.status(200).json({
    success: true,
    data: obj
  });
});

// @desc      Create faculty
// @route     POST /api/v1/faculty
// @access    Private/Admin
export const createFaculty = asyncHandler(async (req, res, next) => {
  // Check if adding an HOD
  if (req.body.designation === 'HOD') {
    const existingHOD = await Faculty.findOne({
      where: {
        departmentId: req.body.department,
        designation: 'HOD'
      },
      include: [{ model: User, as: 'user', attributes: ['name'] }]
    });

    if (existingHOD) {
      return next(new ErrorResponse(`Department already has a Head of Department (${existingHOD.user ? existingHOD.user.name : 'Unknown'}) in faculty records`, 400));
    }
  }

  // Create faculty profile
  req.body.departmentId = req.body.department;
  delete req.body.department;
  const faculty = await Faculty.create(req.body);

  res.status(201).json({
    success: true,
    data: faculty
  });
});

// @desc      Update faculty
// @route     PUT /api/v1/faculty/:id
// @access    Private/Admin
export const updateFaculty = asyncHandler(async (req, res, next) => {
  let faculty = await Faculty.findByPk(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  // Check if updating to an HOD
  if (req.body.designation === 'HOD') {
    const existingHOD = await Faculty.findOne({
      where: {
        departmentId: req.body.department || faculty.departmentId,
        designation: 'HOD',
        id: { [Op.ne]: req.params.id }
      },
      include: [{ model: User, as: 'user', attributes: ['name'] }]
    });

    if (existingHOD) {
      return next(new ErrorResponse(`Department already has a Head of Department (${existingHOD.user ? existingHOD.user.name : 'Unknown'}) in faculty records`, 400));
    }
  }

  if (req.body.department) {
    req.body.departmentId = req.body.department;
    delete req.body.department;
  }
  await Faculty.update(req.body, { where: { id: req.params.id } });
  faculty = await Faculty.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: faculty
  });
});

// @desc      Delete faculty
// @route     DELETE /api/v1/faculty/:id
// @access    Private/Admin
export const deleteFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findByPk(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  await faculty.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get faculty by department
// @route     GET /api/v1/faculty/department/:departmentId
// @access    Private
export const getFacultyByDepartment = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findAll({
    where: {
      departmentId: req.params.departmentId,
      status: 'active'
    },
    include: [
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
    ]
  });

  const facultyData = faculty.map((f) => {
    const obj = f.toJSON();
    obj.firstName = obj.Name || '';
    obj.lastName = '';
    if (obj.department) {
      obj.department.name = obj.department.short_name || obj.department.full_name;
    }
    return obj;
  });

  res.status(200).json({
    success: true,
    count: facultyData.length,
    data: facultyData
  });
});

// @desc      Assign subjects to faculty
// @route     PUT /api/v1/faculty/:id/subjects
// @access    Private/Admin
export const assignSubjects = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findByPk(req.params.id);

  if (faculty) {
    await faculty.setSubjects(req.body.subjects || []);
  }

  const updatedFaculty = await Faculty.findByPk(req.params.id, {
    include: [{ model: Subject, as: 'subjects', attributes: ['name', 'code'] }]
  });

  if (!updatedFaculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: updatedFaculty
  });
});

// @desc      Assign classes to faculty
// @route     PUT /api/v1/faculty/:id/classes
// @access    Private/Admin
export const assignClasses = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findByPk(req.params.id);

  if (faculty) {
    await faculty.setAssignedClasses(req.body.classes || []);
  }

  const updatedFaculty = await Faculty.findByPk(req.params.id, {
    include: [{ model: ClassModel, as: 'assignedClasses' }]
  });

  if (!updatedFaculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: updatedFaculty
  });
});

// @desc      Update faculty status
// @route     PUT /api/v1/faculty/:id/status
// @access    Private/Admin
export const updateFacultyStatus = asyncHandler(async (req, res, next) => {
  await Faculty.update(
    { status: req.body.status },
    { where: { id: req.params.id } }
  );
  const faculty = await Faculty.findByPk(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }


  res.status(200).json({
    success: true,
    data: faculty
  });
});

// @desc      Get faculty profile (for logged in faculty)
// @route     GET /api/v1/faculty/me/profile
// @access    Private/Faculty
export const getMyProfile = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
  // req.user is already the faculty instance loaded by protect middleware
  res.status(200).json({
    success: true,
    data: req.user
  });
});
// @desc      Update faculty profile (for logged in faculty)
// @route     PUT /api/v1/faculty/update-profile
// @access    Private/Faculty
export const updateFacultyProfile = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    console.error('[UPDATE PROFILE] No user found in request');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  // Only allow updating specific fields
  const allowedFields = ['email', 'phone', 'linkedin_url'];
  const fieldsToUpdate = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  if (Object.keys(fieldsToUpdate).length === 0) {
    return next(new ErrorResponse('No valid fields provided to update', 400));
  }

  // Map phone to phone_number for Faculty model
  const facultyUpdateFields = { ...fieldsToUpdate };
  if (facultyUpdateFields.phone) {
    facultyUpdateFields.phone_number = facultyUpdateFields.phone;
    delete facultyUpdateFields.phone;
  }

  // Update Faculty table (Faculty has its own email, phone, linkedin_url fields)
  try {
    await Faculty.update(facultyUpdateFields, { where: { faculty_id: req.user.faculty_id } });

    // Fetch updated faculty record
    const updatedFaculty = await Faculty.findByPk(req.user.faculty_id, {
      include: [
        { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedFaculty
    });
  } catch (error) {
    console.error('[UPDATE PROFILE ERROR]', error);
    return next(new ErrorResponse('Failed to update profile', 500));
  }
});