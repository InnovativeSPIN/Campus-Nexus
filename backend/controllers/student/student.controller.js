import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Student, Department, Class: ClassModel, Subject, StudentBio } = models;
import { Op, Sequelize } from 'sequelize';

// @desc      Get all students
// @route     GET /api/v1/students
// @access    Private
export const getAllStudents = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const rawLimit = parseInt(req.query.limit, 10);
  let limit = 25;
  if (!isNaN(rawLimit)) {
    if (rawLimit > 0) {
      limit = rawLimit;
    } else {
      // treat 0 or negative as unlimited
      limit = null;
    }
  }
  const startIndex = (page - 1) * (limit || 0);

  let where = {};

  // Filter by department
  if (req.query.department) {
    where.departmentId = req.query.department;
  }

  // Filter by class
  if (req.query.class) {
    where.classId = req.query.class;
  }

  // Filter by semester
  if (req.query.semester) {
    where.semester = parseInt(req.query.semester);
  }

  // Filter by batch (academic year) – this takes precedence over studyYear
  if (req.query.batch) {
    where.batch = req.query.batch;
  }

  // support filtering by study year (1..4) from the database column
  if (!req.query.batch && req.query.studyYear) {
    where.year = req.query.studyYear;
  }

  // Filter by status
  if (req.query.status) {
    where.status = req.query.status;
  }

  // Search by name, student ID, or email
  if (req.query.search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${req.query.search}%` } },
      { lastName: { [Op.like]: `%${req.query.search}%` } },
      { studentId: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } },
      { rollNumber: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  const total = await Student.count({ where });
  let students;
  const findOpts = {
    where,
    attributes: { exclude: ['userId'] },
    include: [
      // department model stores short_name/full_name instead of name/code
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
      { model: ClassModel, as: 'class', attributes: ['name', 'section'] }
    ],
    order: [['createdAt', 'DESC']]
  };
  if (limit !== null) {
    findOpts.offset = startIndex;
    findOpts.limit = limit;
  }

  students = await Student.findAll(findOpts);

  // convert to plain objects and add a "name" alias for department
  students = students.map((s) => {
    const obj = s.toJSON();
    if (obj.department) {
      obj.department.name = obj.department.short_name || obj.department.full_name;
    }
    return obj;
  });

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: students
  });
});

// @desc      Get list of academic years (distinct batches) from student profiles
// @route     GET /api/v1/students/academic-years
// @access    Private (department admin or higher)
export const getAcademicYears = asyncHandler(async (req, res, next) => {
  const records = await Student.findAll({
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('batch')), 'batch']],
    where: {
      batch: { [Op.ne]: null }
    },
    order: [[Sequelize.col('batch'), 'DESC']]
  });
  const years = records.map(r => r.get('batch')).filter(y => y !== null);
  res.status(200).json({ success: true, data: years });
});

// @desc      Get single student
// @route     GET /api/v1/students/:id
// @access    Private
export const getStudent = asyncHandler(async (req, res, next) => {
  // fetch the student along with department and class; subjects association
  // was previously included but there is no defined relation, causing a
  // runtime error and resulting in 500 responses when viewing profiles.
  // for now we drop the subjects include; add a proper association later
  // if subject information is actually required.
  const student = await Student.findByPk(req.params.id, {
    attributes: { exclude: ['userId'] },
    include: [
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
      { model: ClassModel, as: 'class', attributes: ['name', 'section', 'room'] }
    ]
  });

  // normalize department name
  if (student && student.department) {
    const dept = student.department.toJSON();
    dept.name = dept.short_name || dept.full_name;
    student.department = dept;
  }

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Create student
// @route     POST /api/v1/students
// @access    Private/Admin
export const createStudent = asyncHandler(async (req, res, next) => {
  // Handle name splitting
  if (req.body.name && (!req.body.firstName || !req.body.lastName)) {
    const parts = req.body.name.trim().split(' ');
    req.body.firstName = parts[0];
    req.body.lastName = parts.slice(1).join(' ') || '.';
  }

  // Set default role_id if missing (3 is student)
  if (!req.body.role_id) {
    req.body.role_id = 3;
  }

  // Set default password — students use 'student123' unless admin provides one
  if (!req.body.password) {
    req.body.password = 'student123';
  }

  // Set default semester if missing
  if (!req.body.semester) {
    req.body.semester = 1;
  }

  // Set default gender if missing
  if (!req.body.gender) {
    req.body.gender = 'other';
  }

  // Generate student ID if not provided
  if (!req.body.studentId) {
    const department = await Department.findByPk(req.body.department || req.body.departmentId);
    const departmentCode = department ? department.short_name || department.full_name : 'GEN';
    req.body.studentId = await Student.generateStudentId(req.body.batch, departmentCode);
  }

  // Ensure rollNumber is set (often same as studentId in this system)
  if (!req.body.rollNumber) {
    req.body.rollNumber = req.body.studentId;
  }

  // Normalize department and class fields
  if (req.body.department) {
    req.body.departmentId = req.body.department;
    delete req.body.department;
  }
  if (req.body.class) {
    req.body.classId = req.body.class;
    delete req.body.class;
  }

  const student = await Student.create(req.body);

  res.status(201).json({
    success: true,
    data: student
  });
});

// @desc      Update student
// @route     PUT /api/v1/students/:id
// @access    Private/Admin
export const updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findByPk(req.params.id, { attributes: { exclude: ['userId'] } });

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  if (req.body.department) {
    req.body.departmentId = req.body.department;
    delete req.body.department;
  }
  if (req.body.class) {
    req.body.classId = req.body.class;
    delete req.body.class;
  }
  await Student.update(req.body, { where: { id: req.params.id } });
  student = await Student.findByPk(req.params.id, { attributes: { exclude: ['userId'] } });

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Delete student
// @route     DELETE /api/v1/students/:id
// @access    Private/Admin
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findByPk(req.params.id, { attributes: { exclude: ['userId'] } });

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  await student.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get students by class
// @route     GET /api/v1/students/class/:classId
// @access    Private
export const getStudentsByClass = asyncHandler(async (req, res, next) => {
  const students = await Student.findAll({
    where: {
      classId: req.params.classId,
      status: 'active'
    },
    attributes: { exclude: ['userId'] },
    include: [{
      model: Department,
      as: 'department',
      attributes: ['short_name', 'full_name'],
      required: false  // Use LEFT JOIN
    }],
    order: [['rollNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc      Get students by department
// @route     GET /api/v1/students/department/:departmentId
// @access    Private
export const getStudentsByDepartment = asyncHandler(async (req, res, next) => {
  const students = await Student.findAll({
    where: {
      departmentId: req.params.departmentId,
      status: 'active'
    },
    attributes: { exclude: ['userId'] },
    include: [{ model: ClassModel, as: 'class', attributes: ['name', 'section'] }],
    order: [['semester', 'ASC'], ['rollNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc      Update student status
// @route     PUT /api/v1/students/:id/status
// @access    Private/Admin
export const updateStudentStatus = asyncHandler(async (req, res, next) => {
  await Student.update(
    { status: req.body.status },
    { where: { id: req.params.id } }
  );
  const student = await Student.findByPk(req.params.id, { attributes: { exclude: ['userId'] } });

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }



  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Promote students to next semester
// @route     PUT /api/v1/students/promote
// @access    Private/Admin
export const promoteStudents = asyncHandler(async (req, res, next) => {
  const { studentIds, newSemester, newClass } = req.body;

  const result = await Student.update(
    {
      semester: newSemester,
      classId: newClass
    },
    { where: { id: { [Op.in]: studentIds } } }
  );

  res.status(200).json({
    success: true,
    message: `${result[0]} students promoted successfully`
  });
});

// @desc      Get student profile (for logged in student)
// @route     GET /api/v1/students/me/profile
// @access    Private/Student
export const getMyProfile = asyncHandler(async (req, res, next) => {
  // also avoid joining subjects due to missing association
  const student = await Student.findOne({
    where: { id: req.user.id },
    attributes: { exclude: ['userId'] },
    include: [
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
      { model: ClassModel, as: 'class', attributes: ['name', 'section', 'room'] },
      { model: StudentBio, as: 'bio' }
    ]
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Update student profile details (for logged in student)
// @route     PUT /api/v1/students/me/profile
// @access    Private/Student
export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const { email, phone, linkedinUrl, alternatePhone, address, city, state, pincode } = req.body;
  const student = await Student.findOne({ where: { id: req.user.id } });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Update Student Core details
  if (email) student.email = email;
  if (phone) student.phone = phone;
  await student.save();

  // Find or Create StudentBio
  let bio = await StudentBio.findOne({ where: { studentId: req.user.id } });
  if (!bio) {
    bio = await StudentBio.create({ studentId: req.user.id });
  }

  // Update Bio fields
  if (linkedinUrl !== undefined) bio.linkedinUrl = linkedinUrl;
  if (alternatePhone !== undefined) bio.alternatePhone = alternatePhone;

  // Manage address JSON
  let addrObj = bio.address || {};
  if (address) addrObj.street = address;
  if (city) addrObj.city = city;
  if (state) addrObj.state = state;
  if (pincode) addrObj.pincode = pincode;
  bio.address = addrObj;

  await bio.save();

  res.status(200).json({
    success: true,
    data: { student, bio }
  });
});

// @desc      Get student statistics
// @route     GET /api/v1/students/stats
// @access    Private/Admin
export const getStudentStats = asyncHandler(async (req, res, next) => {
  const totalStudents = await Student.count();
  const activeStudents = await Student.count({ where: { status: 'active' } });
  // completed now replaces the old graduated status
  const completedStudents = await Student.count({ where: { status: 'completed' } });

  const byDepartment = await Student.findAll({
    where: { status: 'active' },
    attributes: { exclude: ['userId'] },
    group: ['departmentId']
  });

  const bySemester = await Student.findAll({
    where: { status: 'active' },
    attributes: { exclude: ['userId'] },
    group: ['semester'],
    order: [['semester', 'ASC']]
  });

  const byBatch = await Student.findAll({
    where: { status: 'active' },
    attributes: { exclude: ['userId'] },
    group: ['batch'],
    order: [['batch', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      activeStudents,
      completedStudents,
      byDepartment,
      bySemester,
      byBatch
    }
  });
});

// @desc      Upload student photo
// @route     POST /api/v1/students/photo
// @access    Private/Student
export const uploadStudentPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }

  const student = await Student.findOne({ where: { id: req.user.id } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  const photoPath = req.file.path.replace(/\\/g, '/');
  student.photo = photoPath;
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Photo uploaded successfully',
    data: {
      photo: student.photo
    }
  });
});
