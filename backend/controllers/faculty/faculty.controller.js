import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Faculty, User } = models;
// additional models imported from models index
const { Department, Subject, Class: ClassModel } = models;
import { Op } from 'sequelize';
import xlsx from 'xlsx';

// @desc      Get all faculty
// @route     GET /api/v1/faculty
// @access    Private
export const getAllFaculty = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 1000;
  const startIndex = (page - 1) * limit;

  let where = {};

  // Filter by department (column is department_id in DB/model)
  if (req.query.department) {
    where.department_id = req.query.department;
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
      { 
        model: Department, 
        as: 'department', 
        attributes: ['short_name', 'full_name'],
        required: false  // Use LEFT JOIN instead of INNER JOIN
      }
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
      { 
        model: Department, 
        as: 'department', 
        attributes: ['short_name', 'full_name'],
        required: false  // Use LEFT JOIN
      },
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
  console.log('[DEBUG] createFaculty - received body:', req.body);
  
  // Prepare fields for database
  const facultyData = {
    faculty_college_code: req.body.faculty_college_code || req.body.facultyCollegeCode,
    Name: req.body.Name || req.body.name || req.body.firstName,
    email: req.body.email,
    password: req.body.password || 'ns9210',  // Default password
    phone_number: req.body.phone_number || req.body.phoneNumber,
    role_id: req.body.role_id || req.body.roleId || 5,  // Default to faculty role
    department_id: req.body.department_id || req.body.departmentId || req.body.department,
    designation: req.body.designation,
    educational_qualification: req.body.educational_qualification || req.body.educationalQualification,
    phd_status: req.body.phd_status || req.body.phdStatus || 'No',
    gender: req.body.gender,
    date_of_birth: req.body.date_of_birth || req.body.dateOfBirth,
    date_of_joining: req.body.date_of_joining || req.body.dateOfJoining,
    profile_image_url: req.body.profile_image_url || req.body.profileImageUrl,
    status: req.body.status || 'active',
    blood_group: req.body.blood_group || req.body.bloodGroup,
    aadhar_number: req.body.aadhar_number || req.body.aadharNumber,
    pan_number: req.body.pan_number || req.body.panNumber,
    perm_address: req.body.perm_address || req.body.permAddress,
    curr_address: req.body.curr_address || req.body.currAddress,
    linkedin_url: req.body.linkedin_url || req.body.linkedinUrl,
    is_timetable_incharge: req.body.is_timetable_incharge || req.body.isTimetableIncharge || false,
    is_placement_coordinator: req.body.is_placement_coordinator || req.body.isPlacementCoordinator || false
  };

  // Remove null/undefined values
  Object.keys(facultyData).forEach(key => {
    if (facultyData[key] === null || facultyData[key] === undefined) {
      delete facultyData[key];
    }
  });

  console.log('[DEBUG] Creating faculty with data:', facultyData);

  try {
    const faculty = await Faculty.create(facultyData);
    console.log('[DEBUG] Faculty created successfully:', faculty.faculty_college_code);

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: faculty
    });
  } catch (error) {
    console.error('[ERROR] Faculty creation failed:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    return next(new ErrorResponse(`Failed to create faculty: ${error.message}`, 400));
  }
});

// @desc      Update faculty
// @route     PUT /api/v1/faculty/:id
// @access    Private/Admin
export const updateFaculty = asyncHandler(async (req, res, next) => {
  console.log('[DEBUG] updateFaculty - faculty ID:', req.params.id, 'body:', req.body);
  
  let faculty = await Faculty.findByPk(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  // Prepare fields for update (only update provided fields)
  const updateData = {};
  const fieldMap = {
    // Database field: request field options
    'faculty_college_code': ['faculty_college_code', 'facultyCollegeCode'],
    'Name': ['Name', 'name', 'firstName'],
    'email': ['email'],
    'password': ['password'],
    'phone_number': ['phone_number', 'phoneNumber'],
    'role_id': ['role_id', 'roleId'],
    'department_id': ['department_id', 'departmentId', 'department'],
    'designation': ['designation'],
    'educational_qualification': ['educational_qualification', 'educationalQualification'],
    'phd_status': ['phd_status', 'phdStatus'],
    'gender': ['gender'],
    'date_of_birth': ['date_of_birth', 'dateOfBirth'],
    'date_of_joining': ['date_of_joining', 'dateOfJoining'],
    'profile_image_url': ['profile_image_url', 'profileImageUrl'],
    'status': ['status'],
    'blood_group': ['blood_group', 'bloodGroup'],
    'aadhar_number': ['aadhar_number', 'aadharNumber'],
    'pan_number': ['pan_number', 'panNumber'],
    'perm_address': ['perm_address', 'permAddress'],
    'curr_address': ['curr_address', 'currAddress'],
    'linkedin_url': ['linkedin_url', 'linkedinUrl'],
    'is_timetable_incharge': ['is_timetable_incharge', 'isTimetableIncharge'],
    'is_placement_coordinator': ['is_placement_coordinator', 'isPlacementCoordinator']
  };

  // Map request fields to database fields
  Object.entries(fieldMap).forEach(([dbField, requestFields]) => {
    for (let requestField of requestFields) {
      if (req.body[requestField] !== undefined && req.body[requestField] !== null) {
        updateData[dbField] = req.body[requestField];
        break;  // Only use the first match
      }
    }
  });

  console.log('[DEBUG] Updating faculty with data:', updateData);

  try {
    // Update the faculty instance directly
    await faculty.update(updateData);
    
    // Reload with department association
    await faculty.reload({
      include: [
        { 
          model: Department, 
          as: 'department', 
          attributes: ['short_name', 'full_name'],
          required: false
        }
      ]
    });

    console.log('[DEBUG] Faculty updated successfully:', faculty.faculty_college_code);

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: faculty
    });
  } catch (error) {
    console.error('[ERROR] Faculty update failed:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    return next(new ErrorResponse(`Failed to update faculty: ${error.message}`, 400));
  }
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
      { 
        model: Department, 
        as: 'department', 
        attributes: ['short_name', 'full_name'],
        required: false  // Use LEFT JOIN
      }
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

// @desc      Bulk upload faculty records from Excel/CSV file
// @route     POST /api/v1/faculty/upload
// @access    Private/Admin
export const uploadFaculty = asyncHandler(async (req, res, next) => {
  // using express-fileupload middleware
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }
  const file = req.files.file;

  // parse workbook (works for XLSX, XLS, CSV)
  let workbook;
  try {
    workbook = xlsx.read(file.data, { type: 'buffer' });
  } catch (err) {
    return next(new ErrorResponse('Unable to parse spreadsheet file', 400));
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  const created = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // basic required fields
      if (!row.Name || !row.faculty_college_code || !row.email) {
        throw new Error('Missing required Name, faculty_college_code or email');
      }

      const payload = {};
      // copy over any field present in row that matches model column names
      const allowed = [
        'faculty_college_code',
        'coe_id',
        'AICTE_ID',
        'Anna_University_ID',
        'Name',
        'email',
        'phone_number',
        'designation',
        'gender',
        'date_of_birth',
        'date_of_joining',
        'blood_group',
        'aadhar_number',
        'pan_number',
        'perm_address',
        'curr_address',
        'linkedin_url',
        'role_id'
      ];

      allowed.forEach((key) => {
        if (row[key] !== undefined && row[key] !== '') {
          payload[key] = row[key];
        }
      });

      // department handling: accept department_id or department name/code
      if (row.department_id && row.department_id !== '') {
        payload.department_id = row.department_id;
      } else if (row.department && row.department !== '') {
        // try to lookup department by short_name or full_name
        const dept = await Department.findOne({
          where: {
            [Op.or]: [
              { short_name: row.department },
              { full_name: row.department }
            ]
          }
        });
        if (dept) {
          payload.department_id = dept.id;
        }
      }

      // convert dates if necessary
      if (payload.date_of_birth) {
        payload.date_of_birth = new Date(payload.date_of_birth);
      }
      if (payload.date_of_joining) {
        payload.date_of_joining = new Date(payload.date_of_joining);
      }

      // set default password if missing
      payload.password = row.password || '123';
      // if role isn't supplied default to 5 (regular faculty)
      if (!payload.role_id) {
        payload.role_id = 5;
      }

      const faculty = await Faculty.create(payload);
      created.push(faculty);
    } catch (err) {
      errors.push({ row: i + 2, error: err.message });
    }
  }

  res.status(200).json({ success: true, count: created.length, errors });
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
  const allowedFields = ['email', 'phone', 'linkedin_url', 'phd_status'];
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

  // If phd_status is provided, ensure it's the correct column name in the Faculty model
  if (fieldsToUpdate.phd_status !== undefined) {
    facultyUpdateFields.phd_status = fieldsToUpdate.phd_status;
  }

  // Update Faculty table (Faculty has its own email, phone, linkedin_url fields)
  try {
    await Faculty.update(facultyUpdateFields, { where: { faculty_id: req.user.faculty_id } });

    // Fetch updated faculty record
    // If phd-related fields were provided, upsert into faculty_phd table to keep details in sync
    if (fieldsToUpdate.phd_status !== undefined || req.body.orcid_id || req.body.thesis_title || req.body.register_no || req.body.guide_name) {
      try {
        const facultyId = req.user.faculty_id;
        const PhdModel = models.FacultyPhd;
        const existing = await PhdModel.findOne({ where: { faculty_id: facultyId } });
        const phdPayload = {
          faculty_id: facultyId,
          status: fieldsToUpdate.phd_status ?? req.body.status ?? null,
          orcid_id: req.body.orcid_id ?? null,
          thesis_title: req.body.thesis_title ?? null,
          register_no: req.body.register_no ?? null,
          guide_name: req.body.guide_name ?? null
        };
        if (existing) {
          await existing.update(phdPayload);
        } else {
          // create only if there is some meaningful data or status indicates pursuit/yes
          const shouldCreate = phdPayload.status || phdPayload.orcid_id || phdPayload.thesis_title || phdPayload.register_no || phdPayload.guide_name;
          if (shouldCreate) {
            await PhdModel.create(phdPayload);
          }
        }
      } catch (e) {
        console.warn('[UPDATE PROFILE] failed to upsert faculty_phd', e);
      }
    }

    const updatedFaculty = await Faculty.findByPk(req.user.faculty_id, {
      include: [
        { 
          model: Department, 
          as: 'department', 
          attributes: ['short_name', 'full_name'],
          required: false  // Use LEFT JOIN
        }
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

// @desc      Get faculty's timetable
// @route     GET /api/v1/faculty/my-timetable
// @access    Private (Faculty)
export const getMyTimetable = asyncHandler(async (req, res, next) => {
  try {
    const { TimetableSimple } = models;
    const facultyId = req.user.faculty_id;
    
    if (!facultyId) {
      return next(new ErrorResponse('Faculty ID not found', 400));
    }

    // Get faculty college code to match timetable records
    const faculty = await Faculty.findByPk(facultyId, {
      attributes: ['faculty_college_code', 'Name']
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty not found', 404));
    }

    // Fetch timetable records for this faculty
    const timetableRecords = await TimetableSimple.findAll({
      where: {
        facultyId: faculty.faculty_college_code
      },
      attributes: ['day', 'hour', 'subject', 'section', 'academicYear', 'year', 'department'],
      order: [['day', 'ASC'], ['hour', 'ASC']]
    });

    // Format response
    const timetable = timetableRecords.map(record => ({
      day_of_week: record.day,
      period_number: record.hour,
      subject: {
        subject_name: record.subject
      },
      class: {
        name: record.section || 'N/A'
      },
      room_number: 'TBD',
      period_type: 'lecture',
      academic_year: record.academicYear,
      year: record.year
    }));

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('[GET TIMETABLE ERROR]', error);
    return next(new ErrorResponse('Failed to fetch timetable', 500));
  }
});
// @desc      Upload faculty profile photo
// @route     POST /api/v1/faculty/upload-photo
// @access    Private/Faculty
export const uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No file uploaded', 400));
    }

    if (!req.user || !req.user.faculty_id) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    const faculty = await Faculty.findByPk(req.user.faculty_id);
    if (!faculty) {
      return next(new ErrorResponse('Faculty not found', 404));
    }

    // Store relative path for easy access
    const photoPath = `/uploads/${req.file.filename}`;
    faculty.profile_image_url = photoPath;
    await faculty.save();

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: photoPath,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('[UPLOAD PHOTO] Error:', error);
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }
    return next(new ErrorResponse('Failed to upload photo', 500));
  }
});

// @desc      Get faculty profile photo
// @route     GET /api/v1/faculty/:id/photo
// @access    Public
export const getFacultyPhoto = asyncHandler(async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id, {
      attributes: ['faculty_id', 'Name', 'profile_image_url']
    });

    if (!faculty || !faculty.profile_image_url) {
      return next(new ErrorResponse('Photo not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        faculty_id: faculty.faculty_id,
        name: faculty.Name,
        photoUrl: faculty.profile_image_url
      }
    });
  } catch (error) {
    console.error('[GET PHOTO] Error:', error);
    return next(new ErrorResponse('Failed to fetch photo', 500));
  }
});