import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
const { Student, Department, Class: ClassModel, Subject, StudentBio, CourseLessonPlan, Faculty } = models;

// Helper function to ensure parentInfo has all required fields with defaults
const ensureCompleteParentInfo = (parentInfo) => {
  if (!parentInfo) return null;

  // Handle case where parentInfo might be a string from the database
  let data = parentInfo;
  if (typeof parentInfo === 'string') {
    try {
      data = JSON.parse(parentInfo);
    } catch (e) {
      console.error('Failed to parse parentInfo JSON string:', e);
      return null;
    }
  }

  const f = data.father || {};
  const m = data.mother || {};

  // Handle guardians - could be array or single object (legacy)
  let guardiansArray = [];
  if (Array.isArray(data.guardians)) {
    guardiansArray = data.guardians;
  } else if (data.guardian && typeof data.guardian === 'object') {
    // Legacy: single guardian object, convert to array
    guardiansArray = [data.guardian];
  }

  return {
    father: {
      name: f.name || '',
      phone: f.phone || '',
      email: f.email || '',
      occupation: f.occupation || '',
      qualification: f.qualification || '',
      // Handle both camelCase and lowercase as we've seen it both ways
      annualIncome: f.annualIncome || f.annualincome || '',
    },
    mother: {
      name: m.name || '',
      phone: m.phone || '',
      email: m.email || '',
      occupation: m.occupation || '',
      qualification: m.qualification || '',
      annualIncome: m.annualIncome || m.annualincome || '',
    },
    guardians: guardiansArray,
    siblings: data.siblings || [],
  };
};
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
      { model: ClassModel, as: 'class', attributes: ['name'] }
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
  const { StudentBio } = models;

  const student = await Student.findByPk(req.params.id, {
    attributes: { exclude: ['userId'] },
    include: [
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
      { model: ClassModel, as: 'class', attributes: ['name', 'room'] }
    ]
  });

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  const studentData = student.toJSON();

  // Fetch student bio data and merge it (if StudentBio model exists)
  try {
    if (StudentBio) {
      const studentBio = await StudentBio.findOne({ where: { studentId: student.id } });
      if (studentBio) {
        const bioData = studentBio.toJSON();
        // Ensure parentInfo has all required fields
        if (bioData.parentInfo) {
          bioData.parentInfo = ensureCompleteParentInfo(bioData.parentInfo);
        }
        studentData.bio = bioData;
        // Merge bio fields into main object for easier frontend access
        Object.assign(studentData, bioData);
      }
    }
  } catch (err) {
    console.error('Error fetching StudentBio:', err);
    // Continue without bio data if error occurs
  }

  // normalize department name
  if (studentData.department) {
    const dept = studentData.department;
    dept.name = dept.short_name || dept.full_name;
  }

  res.status(200).json({
    success: true,
    data: studentData
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

  // Extract and create student bio if bio fields are provided
  const { StudentBio } = models;
  const bioFields = ['alternatePhone', 'linkedinUrl', 'dateOfBirth', 'bloodGroup', 'nationality', 'religion', 'category', 'aadharNo', 'motherTongue', 'residenceType', 'address', 'permanentAddress', 'parentInfo', 'references', 'previousEducation', 'scholarshipDetails', 'documents'];
  const bioData = { studentId: student.id };
  let hasBioData = false;

  bioFields.forEach(field => {
    if (field in req.body) {
      bioData[field] = req.body[field];
      hasBioData = true;
    }
  });

  if (hasBioData && StudentBio) {
    try {
      await StudentBio.create(bioData);
    } catch (err) {
      console.error('Error creating StudentBio:', err);
    }
  }

  // Fetch and merge bio data in response
  let responseData = student.toJSON();
  try {
    if (StudentBio) {
      const studentBio = await StudentBio.findOne({ where: { studentId: student.id } });
      if (studentBio) {
        const studentBioData = studentBio.toJSON();
        responseData.bio = studentBioData;
        Object.assign(responseData, studentBioData);
      }
    }
  } catch (err) {
    console.error('Error fetching StudentBio after create:', err);
  }

  res.status(201).json({
    success: true,
    data: responseData
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

  // Extract bio fields that belong to StudentBio table
  const bioFields = ['alternatePhone', 'linkedinUrl', 'dateOfBirth', 'bloodGroup', 'nationality', 'religion', 'category', 'aadharNo', 'motherTongue', 'residenceType', 'address', 'permanentAddress', 'parentInfo', 'references', 'previousEducation', 'scholarshipDetails', 'documents'];
  const bioData = {};
  const profileData = { ...req.body };

  bioFields.forEach(field => {
    if (field in profileData) {
      bioData[field] = profileData[field];
      delete profileData[field];
    }
  });

  // Remove computed/frontend-only fields that don't exist in Student model
  const invalidFields = ['name', 'avatar', 'enrollmentYear', 'departmentName', 'bio', 'department', 'class'];
  invalidFields.forEach(field => delete profileData[field]);

  // Update student profile
  try {
    // If studentId is being updated, check for duplicates
    if (profileData.studentId && profileData.studentId !== student.studentId) {
      const existingStudent = await Student.findOne({ where: { studentId: profileData.studentId } });
      if (existingStudent) {
        return next(new ErrorResponse(`Student ID '${profileData.studentId}' is already in use by another student`, 400));
      }
    }
    console.log('Updating student with data:', JSON.stringify(profileData, null, 2));
    const updateResult = await Student.update(profileData, { where: { id: req.params.id } });
    console.log('Update result:', updateResult);
  } catch (err) {
    console.error('Error updating student profile:', err.message, 'Errors:', err.errors);
    return next(new ErrorResponse(`Failed to update student: ${err.message}`, 400));
  }

  // Update student bio if there are bio fields
  if (Object.keys(bioData).length > 0) {
    const { StudentBio } = models;
    try {
      if (StudentBio) {
        const studentBio = await StudentBio.findOne({ where: { studentId: req.params.id } });
        if (studentBio) {
          if (bioData.parentInfo) {
            bioData.parentInfo = ensureCompleteParentInfo(bioData.parentInfo);
          }
          await studentBio.update(bioData);
        } else {
          // Create new bio record if it doesn't exist
          if (bioData.parentInfo) {
            bioData.parentInfo = ensureCompleteParentInfo(bioData.parentInfo);
          }
          await StudentBio.create({ studentId: req.params.id, ...bioData });
        }
      }
    } catch (err) {
      console.error('Error updating StudentBio:', err.message);
      // Continue even if bio update fails - don't block the response
    }
  }

  // Fetch updated student with department and class info
  student = await Student.findByPk(req.params.id, {
    attributes: { exclude: ['userId'] },
    include: [
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
      { model: ClassModel, as: 'class', attributes: ['name', 'room'] }
    ]
  });

  const studentData = student.toJSON();

  // Fetch and merge updated bio data
  try {
    const { StudentBio } = models;
    if (StudentBio) {
      const studentBio = await StudentBio.findOne({ where: { studentId: req.params.id } });
      if (studentBio) {
        const bioData = studentBio.toJSON();
        // Ensure parentInfo has all required fields
        if (bioData.parentInfo) {
          bioData.parentInfo = ensureCompleteParentInfo(bioData.parentInfo);
        }
        studentData.bio = bioData;
        // Merge bio fields into main object
        Object.assign(studentData, bioData);
      }
    }
  } catch (err) {
    console.error('Error fetching StudentBio after update:', err);
  }

  // Normalize department name
  if (studentData.department) {
    const dept = studentData.department;
    dept.name = dept.short_name || dept.full_name;
  }

  res.status(200).json({
    success: true,
    data: studentData
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
    include: [{ model: ClassModel, as: 'class', attributes: ['name'] }],
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
      {
        model: StudentBio,
        as: 'bio',
        attributes: ['id', 'studentId', 'alternatePhone', 'linkedinUrl', 'dateOfBirth', 'bloodGroup',
          'nationality', 'religion', 'category', 'aadharNo', 'motherTongue', 'residenceType',
          'address', 'permanentAddress', 'parentInfo', 'references', 'familyPhoto',
          'previousEducation', 'scholarshipDetails', 'documents', 'createdAt', 'updatedAt']
      }
    ]
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  const studentData = student.toJSON();

  // Ensure address is properly parsed if it's a string
  if (studentData.bio && studentData.bio.address) {
    if (typeof studentData.bio.address === 'string') {
      try {
        studentData.bio.address = JSON.parse(studentData.bio.address);
      } catch (e) {
        console.error('[DEBUG-getMyProfile] Failed to parse address string:', e);
      }
    }
  }

  // Ensure parentInfo has all required fields if it exists
  if (studentData.bio && studentData.bio.parentInfo) {
    studentData.bio.parentInfo = ensureCompleteParentInfo(studentData.bio.parentInfo);
  }

  res.status(200).json({
    success: true,
    data: studentData
  });
});

// @desc      Update student profile details (for logged in student)
// @route     PUT /api/v1/students/me/profile
// @access    Private/Student
export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const {
    email, phone, linkedinUrl, alternatePhone,
    address, city, district, state, pincode,
    nationality, religion, category, aadharNo,
    bloodGroup, motherTongue, residenceType,
    dateOfBirth, parentInfo, references, siblings
  } = req.body;

  const student = await Student.findOne({ where: { id: req.user.id } });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Update Student Core details (only those that are allowed to be changed)
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
  if (nationality !== undefined) bio.nationality = nationality;
  if (religion !== undefined) bio.religion = religion;
  if (category !== undefined) bio.category = category;
  if (aadharNo !== undefined) bio.aadharNo = aadharNo;
  if (bloodGroup !== undefined) bio.bloodGroup = bloodGroup;
  if (motherTongue !== undefined) bio.motherTongue = motherTongue;
  if (residenceType !== undefined) bio.residenceType = residenceType;
  if (dateOfBirth !== undefined) bio.dateOfBirth = dateOfBirth;
  if (parentInfo !== undefined) {
    const cleanedParentInfo = ensureCompleteParentInfo(parentInfo);
    console.log('[PARENT INFO UPDATE] Received:', JSON.stringify(parentInfo));
    console.log('[PARENT INFO UPDATE] Processed:', JSON.stringify(cleanedParentInfo));
    bio.parentInfo = cleanedParentInfo;
  }
  if (references !== undefined) bio.references = references;
  if (siblings !== undefined) bio.siblings = siblings;

  // Manage address JSON - ensure it's an object, not a string
  let addrObj = bio.address;
  if (typeof addrObj === 'string') {
    try {
      addrObj = JSON.parse(addrObj);
    } catch (e) {
      addrObj = {};
    }
  }
  if (!addrObj || typeof addrObj !== 'object') {
    addrObj = {};
  }

  if (address !== undefined) addrObj.street = address;
  if (city !== undefined) addrObj.city = city;
  if (district !== undefined) addrObj.city = district; // Map district to city field for storage
  if (state !== undefined) addrObj.state = state;
  if (pincode !== undefined) addrObj.pincode = pincode;
  bio.address = addrObj;
  bio.changed('address', true); // Mark address field as changed for Sequelize to detect updates

  // Track changes but don't auto-approve if we want a formal approval flow later.
  // For now, we update it directly to ensure the "dynamic" promise is met.
  await bio.save();
  console.log('[PARENT INFO SAVED] Bio after save:', JSON.stringify(bio.toJSON(), null, 2));

  res.status(200).json({
    success: true,
    data: {
      student: student.toJSON ? student.toJSON() : student,
      bio: bio.toJSON ? bio.toJSON() : bio
    }
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
// @desc      Upload student photo (admin)
// @route     PUT /api/v1/students/:id/photo
// @access    Private/Admin
export const uploadStudentPhotoAdmin = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }

  const student = await Student.findByPk(req.params.id);
  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Generate filename with student name and ID
  const studentNameFormatted = `${student.firstName}_${student.lastName}`.replace(/\s+/g, '_').toLowerCase();
  const ext = path.extname(req.file.originalname);
  const filename = `student_${student.id}_${studentNameFormatted}${ext}`;

  // Move file to permanent location with student name
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'photos');

  try {
    // Create the photos directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);

    // Read the uploaded file and write to new location
    await fsPromises.rename(req.file.path, filepath);

    const photoPath = `/uploads/photos/${filename}`;
    await Student.update({ photo: photoPath }, { where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photo: photoPath
      }
    });
  } catch (err) {
    console.error('Error uploading photo:', err);
    next(new ErrorResponse(`Error uploading photo: ${err.message}`, 500));
  }
});

export const uploadStudentPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }

  const student = await Student.findOne({ where: { id: req.user.id } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Generate filename with student name and ID
  const studentNameFormatted = `${student.firstName}_${student.lastName}`.replace(/\s+/g, '_').toLowerCase();
  const ext = path.extname(req.file.originalname);
  const filename = `student_${student.id}_${studentNameFormatted}${ext}`;

  // Move file to permanent location with student name
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'photos', 'profile');

  try {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);

    // Move the uploaded file to permanent location
    await fsPromises.rename(req.file.path, filepath);

    const photoPath = `/uploads/photos/profile/${filename}`;
    student.photo = photoPath;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        photo: student.photo
      }
    });
  } catch (err) {
    console.error('Error uploading photo:', err);
    next(new ErrorResponse(`Error uploading photo: ${err.message}`, 500));
  }
});

// @desc      Upload family photo
// @route     PUT /api/v1/students/me/family-photo
// @access    Private/Student
export const uploadFamilyPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('No family photo uploaded', 400));
  }

  const student = await Student.findOne({ where: { id: req.user.id } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Generate filename with student name and ID
  const studentNameFormatted = `${student.firstName}_${student.lastName}`.replace(/\s+/g, '_').toLowerCase();
  const ext = path.extname(req.file.originalname);
  const filename = `family_${student.id}_${studentNameFormatted}${ext}`;

  // Move file to permanent location with student name
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'photos', 'family');

  try {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);

    // Move the uploaded file to permanent location
    await fsPromises.rename(req.file.path, filepath);

    const familyPhotoPath = `/uploads/photos/family/${filename}`;

    // Store in StudentBio if available, or create new bio record
    let bio = await StudentBio.findOne({ where: { studentId: student.id } });

    if (!bio) {
      bio = await StudentBio.create({
        studentId: student.id,
        familyPhoto: familyPhotoPath
      });
    } else {
      bio.familyPhoto = familyPhotoPath;
      await bio.save();
    }

    res.status(200).json({
      success: true,
      message: 'Family photo updated successfully',
      data: {
        familyPhoto: familyPhotoPath
      }
    });
  } catch (err) {
    console.error('Error uploading family photo:', err);
    next(new ErrorResponse(`Error uploading family photo: ${err.message}`, 500));
  }
});

// @desc      Upload reference photo
// @route     POST /api/v1/students/me/reference-photo
// @access    Private/Student
export const uploadReferencePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('No reference photo uploaded', 400));
  }

  const student = await Student.findOne({ where: { id: req.user.id } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  const studentNameFormatted = `${student.firstName}_${student.lastName}`.replace(/\s+/g, '_').toLowerCase();
  const ext = path.extname(req.file.originalname);
  const timeStamp = Date.now();
  const filename = `reference_${student.id}_${studentNameFormatted}_${timeStamp}${ext}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'photos', 'references');

  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filepath = path.join(uploadsDir, filename);
    await fsPromises.rename(req.file.path, filepath);
    const referencePhotoPath = `/uploads/photos/references/${filename}`;

    res.status(200).json({
      success: true,
      message: 'Reference photo uploaded successfully',
      data: { photo: referencePhotoPath }
    });
  } catch (err) {
    console.error('Error uploading reference photo:', err);
    next(new ErrorResponse(`Error uploading reference photo: ${err.message}`, 500));
  }
});

// @desc      Download student bulk upload template
// @route     GET /api/v1/students/bulk/template
// @access    Private/Admin
export const downloadBulkTemplate = asyncHandler(async (req, res, next) => {
  // Get departments for reference
  const departments = await Department.findAll({ attributes: ['id', 'short_name'] });

  // CSV headers with example data
  const headers = ['studentId', 'rollNumber', 'firstName', 'lastName', 'email', 'phone', 'gender', 'departmentId', 'batch', 'semester', 'year', 'admissionNo', 'emisNo', 'status'];

  // Create example row
  const exampleRow = [
    'STU001',
    'ROLL001',
    'John',
    'Doe',
    'john.doe@example.com',
    '9876543210',
    'male',
    '1',
    '2024-2028',
    '1',
    '1',
    'ADM001',
    'EMIS001',
    'active'
  ];

  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  csvContent += exampleRow.join(',') + '\n';

  // Add reference section as comments
  csvContent += '\n# Field Descriptions:\n';
  csvContent += '# studentId: Unique student identifier (required, must be unique)\n';
  csvContent += '# rollNumber: Roll number (required)\n';
  csvContent += '# firstName: Student first name (required)\n';
  csvContent += '# lastName: Student last name (required)\n';
  csvContent += '# email: Student email (required, must be unique)\n';
  csvContent += '# phone: Student phone number (required, 10 digits)\n';
  csvContent += '# gender: male, female, or other (required)\n';
  csvContent += '# departmentId: Department ID (required) - Available IDs: ' + departments.map(d => `${d.id}(${d.short_name})`).join(', ') + '\n';
  csvContent += '# batch: Academic batch e.g., 2024-2028 (required)\n';
  csvContent += '# semester: Semester number 1-8 (required)\n';
  csvContent += '# year: Study year 1-4 (required)\n';
  csvContent += '# admissionNo: Admission number (optional)\n';
  csvContent += '# emisNo: EMIS number (optional)\n';
  csvContent += '# status: active, inactive, graduated, dropped, or suspended (default: active)\n';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="student_bulk_upload_template.csv"');
  res.send(csvContent);
});

// @desc      Bulk upload students
// @route     POST /api/v1/students/bulk/upload
// @access    Private/Admin
export const bulkUploadStudents = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }

  try {
    // Parse CSV content
    const fileContent = req.file.buffer.toString('utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    if (lines.length < 2) {
      return next(new ErrorResponse('CSV must contain headers and at least one data row', 400));
    }

    // Extract headers
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredFields = ['studentId', 'rollNumber', 'firstName', 'lastName', 'email', 'phone', 'gender', 'departmentId', 'batch', 'semester', 'year'];

    // Validate headers
    const missingHeaders = requiredFields.filter(field => !headers.includes(field));
    if (missingHeaders.length > 0) {
      return next(new ErrorResponse(`Missing required headers: ${missingHeaders.join(', ')}`, 400));
    }

    // Parse data rows
    const students = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, idx) => {
        row[header] = values[idx] || null;
      });

      // Basic validation
      if (!row.studentId) errors.push(`Row ${i}: studentId is required`);
      if (!row.firstName) errors.push(`Row ${i}: firstName is required`);
      if (!row.lastName) errors.push(`Row ${i}: lastName is required`);
      if (!row.email) errors.push(`Row ${i}: email is required`);
      if (!row.phone || !/^\d{10}$/.test(row.phone)) errors.push(`Row ${i}: phone must be 10 digits`);
      if (!['male', 'female', 'other'].includes(row.gender)) errors.push(`Row ${i}: gender must be male, female, or other`);
      if (!row.departmentId) errors.push(`Row ${i}: departmentId is required`);
      if (!row.batch) errors.push(`Row ${i}: batch is required`);
      if (!row.semester || isNaN(row.semester)) errors.push(`Row ${i}: semester must be a number`);
      if (!row.year || isNaN(row.year)) errors.push(`Row ${i}: year must be a number`);

      if (errors.length === 0) {
        // Set defaults
        row.role_id = 3; // student role
        row.password = 'student123'; // default password
        row.status = row.status || 'active';
        row.departmentId = parseInt(row.departmentId);
        row.semester = parseInt(row.semester);
        row.year = String(row.year);

        students.push(row);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors: errors.slice(0, 20) // Return first 20 errors
      });
    }

    if (students.length === 0) {
      return next(new ErrorResponse('No valid student records to upload', 400));
    }

    // Bulk create students
    const createdStudents = [];
    const createErrors = [];

    for (const studentData of students) {
      try {
        const student = await Student.create(studentData);
        createdStudents.push(student.id);
      } catch (error) {
        createErrors.push(`Failed to create student ${studentData.studentId}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdStudents.length} students`,
      data: {
        totalRequested: students.length,
        successfullyCreated: createdStudents.length,
        failed: createErrors.length,
        errors: createErrors.length > 0 ? createErrors.slice(0, 10) : undefined
      }
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return next(new ErrorResponse(`Error processing file: ${error.message}`, 400));
  }
});

// @desc      Get student syllabus (approved course plans)
// @route     GET /api/v1/student/syllabus
// @access    Private/Student
export const getStudentSyllabus = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  const { semester: querySemester } = req.query;

  try {
    // Get student with their class info
    const student = await Student.findOne({
      where: { id: studentId },
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'section', 'batch', 'semester']
        }
      ]
    });

    if (!student || !student.class) {
      return next(new ErrorResponse('Student or class information not found', 404));
    }

    // Determine which semester to fetch
    const semesterVal = querySemester ? parseInt(querySemester, 10) : student.class.semester || 6;

    // Get approved course plans for the student's class and semester
    const coursePlans = await CourseLessonPlan.findAll({
      where: {
        class_id: student.class.id,
        semester: semesterVal,
        approval_status: 'approved' // Only approved topics
      },
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'Name', 'faculty_college_code', 'email']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name', 'subject_code']
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      order: [['subject_id', 'ASC'], ['sno', 'ASC']],
      raw: false
    });

    // Group topics by subject and faculty
    const groupedBySubject = {};

    coursePlans.forEach(plan => {
      const subjectId = plan.subject.id;

      if (!groupedBySubject[subjectId]) {
        groupedBySubject[subjectId] = {
          id: plan.id,
          subject: plan.subject,
          faculty: plan.faculty,
          class: plan.class,
          academic_year: plan.academic_year,
          semester: plan.semester,
          topics: []
        };
      }

      groupedBySubject[subjectId].topics.push({
        id: plan.id,
        sno: plan.sno,
        unit_number: plan.unit_number,
        unit_label: plan.unit_label,
        topic: plan.topic,
        co_number: plan.co_number,
        btl: plan.btl,
        delivery_mode: plan.delivery_mode,
        reference_book: plan.reference_book,
        periods_required: plan.periods_required,
        approval_status: plan.approval_status
      });
    });

    const syllabusData = Object.values(groupedBySubject);

    res.status(200).json({
      success: true,
      count: syllabusData.length,
      totalTopics: coursePlans.length,
      data: syllabusData
    });
  } catch (error) {
    console.error('[getStudentSyllabus] Error:', error);
    return next(new ErrorResponse(`Error fetching syllabus: ${error.message}`, 500));
  }
});
