import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Faculty, User, TimetableMaster } = models;
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

  // Disable caching for API responses
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

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
  const allowedFields = [
    'email',
    'phone',
    'phone_number',
    'linkedin_url',
    'phd_status',
    'thesis_title',
    'register_no',
    'guide_name',
    'address',
    'curr_address',
    'perm_address',
    'aicteId',
    'AICTE_ID',
    'coeId',
    'Anna_University_ID',
    'orcidId',
    'orcid_id',
    'dob',
    'dateOfBirth',
    'date_of_birth',
    'joiningDate',
    'dateOfJoining',
    'date_of_joining',
    'bloodGroup',
    'blood_group',
    'aadharNumber',
    'aadhar_number',
    'panNumber',
    'pan_number'
  ];
  const fieldsToUpdate = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  if (Object.keys(fieldsToUpdate).length === 0) {
    return next(new ErrorResponse('No valid fields provided to update', 400));
  }

  // Map frontend field names to database/model field names
  const facultyUpdateFields = {};

  // Basic Info
  if (fieldsToUpdate.email) facultyUpdateFields.email = fieldsToUpdate.email;
  if (fieldsToUpdate.phone || fieldsToUpdate.phone_number) {
    facultyUpdateFields.phone_number = fieldsToUpdate.phone || fieldsToUpdate.phone_number;
  }
  if (fieldsToUpdate.linkedin_url) facultyUpdateFields.linkedin_url = fieldsToUpdate.linkedin_url;

  // PhD status
  if (fieldsToUpdate.phd_status) facultyUpdateFields.phd_status = fieldsToUpdate.phd_status;

  // Addresses
  if (fieldsToUpdate.address || fieldsToUpdate.curr_address) {
    facultyUpdateFields.curr_address = fieldsToUpdate.address || fieldsToUpdate.curr_address;
  }
  if (fieldsToUpdate.perm_address) facultyUpdateFields.perm_address = fieldsToUpdate.perm_address;

  // IDs - Store as strings (can handle large numbers and special formats)
  if (fieldsToUpdate.aicteId || fieldsToUpdate.AICTE_ID) {
    const aicteVal = fieldsToUpdate.aicteId || fieldsToUpdate.AICTE_ID;
    facultyUpdateFields.AICTE_ID = aicteVal ? String(aicteVal).trim() : null;
  }
  if (fieldsToUpdate.coeId || fieldsToUpdate.Anna_University_ID) {
    const coeVal = fieldsToUpdate.coeId || fieldsToUpdate.Anna_University_ID;
    facultyUpdateFields.Anna_University_ID = coeVal ? String(coeVal).trim() : null;
  }
  if (fieldsToUpdate.aadharNumber || fieldsToUpdate.aadhar_number) {
    facultyUpdateFields.aadhar_number = fieldsToUpdate.aadharNumber || fieldsToUpdate.aadhar_number;
  }
  if (fieldsToUpdate.panNumber || fieldsToUpdate.pan_number) {
    facultyUpdateFields.pan_number = fieldsToUpdate.panNumber || fieldsToUpdate.pan_number;
  }

  // Dates
  if (fieldsToUpdate.dob || fieldsToUpdate.dateOfBirth || fieldsToUpdate.date_of_birth) {
    facultyUpdateFields.date_of_birth = fieldsToUpdate.dob || fieldsToUpdate.dateOfBirth || fieldsToUpdate.date_of_birth;
  }
  if (fieldsToUpdate.joiningDate || fieldsToUpdate.dateOfJoining || fieldsToUpdate.date_of_joining) {
    facultyUpdateFields.date_of_joining = fieldsToUpdate.joiningDate || fieldsToUpdate.dateOfJoining || fieldsToUpdate.date_of_joining;
  }

  // Other
  if (fieldsToUpdate.bloodGroup || fieldsToUpdate.blood_group) {
    facultyUpdateFields.blood_group = fieldsToUpdate.bloodGroup || fieldsToUpdate.blood_group;
  }

  // Update Faculty table
  try {
    if (Object.keys(facultyUpdateFields).length > 0) {
      await Faculty.update(facultyUpdateFields, { where: { faculty_id: req.user.faculty_id } });
    }

    // Fetch updated faculty record
    // If phd-related fields were provided, upsert into faculty_phd table to keep details in sync
    if (fieldsToUpdate.phd_status !== undefined || fieldsToUpdate.orcid_id || fieldsToUpdate.thesis_title || fieldsToUpdate.register_no || fieldsToUpdate.guide_name) {
      try {
        const facultyId = req.user.faculty_id;
        const PhdModel = models.FacultyPhd;
        const existing = await PhdModel.findOne({ where: { faculty_id: facultyId } });
        const phdPayload = {
          faculty_id: facultyId,
          status: fieldsToUpdate.phd_status ?? null,
          orcid_id: fieldsToUpdate.orcid_id ?? null,
          thesis_title: fieldsToUpdate.thesis_title ?? null,
          register_no: fieldsToUpdate.register_no ?? null,
          guide_name: fieldsToUpdate.guide_name ?? null
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

    // Serialize safely to plain object
    const response = {
      success: true,
      data: updatedFaculty ? updatedFaculty.toJSON ? updatedFaculty.toJSON() : updatedFaculty : null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('[UPDATE PROFILE ERROR]', {
      message: error.message,
      stack: error.stack,
      facultyId: req.user.faculty_id,
      fieldsToUpdate: Object.keys(facultyUpdateFields)
    });
    // Always return valid JSON on error
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + (error.message || 'Unknown error'),
      error: {
        type: error.name || 'Error',
        details: error.message || 'No details available'
      }
    });
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

// @desc      Get my class incharge details and students
// @route     GET /api/v1/faculty/me/class-incharge
// @access    Private/Faculty
export const getMyClassIncharge = asyncHandler(async (req, res, next) => {
  const { ClassIncharge, Student } = models;
  const facultyId = req.user.faculty_id;

  if (!facultyId) {
    return next(new ErrorResponse('Faculty ID not found', 400));
  }

  // Find active class incharge record for this faculty
  let incharge = await ClassIncharge.findOne({
    where: { faculty_id: facultyId, status: 'active' },
    include: [
      {
        model: ClassModel,
        as: 'class',
        attributes: ['id', 'name', 'capacity', 'department_id', 'semester', 'section', 'batch'],
        include: [
          { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
        ]
      }
    ]
  });

  // If no explicit class incharge record exists, fall back to timetable master assignments
  if (!incharge) {
    const timetable = await TimetableMaster.findOne({
      where: {
        status: { [Op.in]: ['draft', 'active'] },
        [Op.or]: [
          { class_coordinator_id: facultyId },
          { asst_coordinator_id: facultyId },
          { timetable_incharge_id: facultyId }
        ]
      },
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'capacity', 'department_id', 'semester', 'section', 'batch'],
          include: [
            { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
          ]
        }
      ]
    });

    if (timetable) {
      incharge = {
        id: timetable.id,
        academic_year: timetable.academic_year,
        semester: timetable.semester,
        semester_type: timetable.semester_type,
        class_id: timetable.class_id,
        class: timetable.class,
      };
    }
  }

  if (!incharge) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No active class incharge assignment found'
    });
  }

  const assignedClass = incharge.class;

  let studentWhereClause = { classId: incharge.class_id };

  const students = await Student.findAll({
    where: studentWhereClause,
    attributes: ['id', 'studentId', 'firstName', 'lastName', 'email', 'phone', 'status'],
    order: [['studentId', 'ASC']]
  });

  console.log(`[ClassIncharge] Found ${students.length} students for class_id=${incharge.class_id}`);

  res.status(200).json({
    success: true,
    data: {
      incharge: {
        id: incharge.id,
        academic_year: incharge.academic_year || assignedClass?.academic_year,
        semester: incharge.semester || assignedClass?.semester,
        semester_type: incharge.semester_type || (assignedClass?.semester ? (assignedClass.semester % 2 === 0 ? 'even' : 'odd') : null),
        class: assignedClass
      },
      students,
      totalStudents: students.length
    }
  });
});

// @desc      Get my timetable-related roles (class coordinator / timetable incharge)
// @route     GET /api/v1/faculty/me/timetable-roles
// @access    Private/Faculty
export const getMyTimetableRoles = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  if (!facultyId) {
    return next(new ErrorResponse('Faculty ID not found', 400));
  }

  // Only check active timetables where this faculty is the timetable_incharge
  // within their own department — this is the gate for Timetable Management access
  const inchargeTimetables = await TimetableMaster.findAll({
    where: {
      status: 'active',
      department_id: departmentId,
      timetable_incharge_id: facultyId,
    },
    attributes: ['id', 'department_id', 'class_id', 'academic_year', 'semester',
      'class_coordinator_id', 'asst_coordinator_id', 'timetable_incharge_id'],
    include: [
      { model: ClassModel, as: 'class', attributes: ['id', 'name', 'semester'] },
    ],
    raw: false,
  });

  const isTimetableIncharge = inchargeTimetables.length > 0 || 
    req.user.is_timetable_incharge === 1 || 
    req.user.is_timetable_incharge === true || 
    req.user.is_timetable_incharge === '1';

  // Also check class coordinator / asst coordinator assignments (informational only)
  const classCoordCount = await TimetableMaster.count({
    where: {
      status: 'active',
      department_id: departmentId,
      [Op.or]: [
        { class_coordinator_id: facultyId },
        { asst_coordinator_id: facultyId },
      ],
    },
  });
  const isClassCoordinator = classCoordCount > 0;

  // Only timetable incharge gets access to the Management page
  const isAnyCoordinator = isTimetableIncharge;

  const assignedTimetableIds = inchargeTimetables.map(t => t.id);

  res.status(200).json({
    success: true,
    data: {
      isClassCoordinator,
      isTimetableIncharge,
      isAnyCoordinator,
      departmentId: departmentId || null,
      assignedTimetableIds,
    },
  });
});

// @desc      Get faculty colleagues in same department (for leave reassign)
// @route     GET /api/v1/faculty/me/department-colleagues
// @access    Private/Faculty
export const getDepartmentColleagues = asyncHandler(async (req, res, next) => {
  const departmentId = parseInt(req.user.departmentId || req.user.department_id, 10);
  const currentFacultyId = parseInt(req.user.faculty_id || req.user.id, 10);

  if (!departmentId || isNaN(departmentId)) {
    return res.status(200).json({ success: true, data: [] });
  }

  try {
    console.log('[GetColleagues] departmentId:', departmentId, 'currentFacultyId:', currentFacultyId);

    const colleagues = await Faculty.findAll({
      where: {
        department_id: departmentId,
        status: 'active',
        faculty_id: { [Op.ne]: currentFacultyId },
      },
      attributes: ['faculty_id', 'Name', 'designation', 'email', 'faculty_college_code'],
      order: [['Name', 'ASC']],
      raw: true,
    });

    console.log('[GetColleagues] Found', colleagues.length, 'colleagues for dept', departmentId);
    res.status(200).json({ success: true, data: colleagues });
  } catch (error) {
    console.error('[GetColleagues] Error:', error.message);
    return next(new ErrorResponse(`Error fetching colleagues: ${error.message}`, 500));
  }
});
