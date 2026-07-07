import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const { Student, MentorAllocation, StudentBio, Department } = models;

// @route   GET /api/v1/faculty/mentorship/my-mentees
// @desc    Get all mentees assigned to the logged-in faculty
// @access  Private (Faculty)
export const getMyMentees = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;
  const { academic_year } = req.query;

  if (!academic_year) {
    return next(new ErrorResponse('Please provide academic_year', 400));
  }

  const allocations = await MentorAllocation.findAll({
    where: { faculty_id: facultyId, academic_year, status: 'active' },
    attributes: ['student_id']
  });

  if (!allocations.length) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }

  const studentIds = allocations.map(a => a.student_id);

  const students = await Student.findAll({
    where: { id: studentIds, status: 'active' },
    attributes: ['id', 'studentId', 'rollNumber', 'firstName', 'lastName', 'email', 'phone', 'gender', 'photo', 'year', 'semester', 'batch'],
    include: [
      { model: Department, as: 'department', attributes: ['short_name'] }
    ]
  });

  const result = students.map(s => {
    const obj = s.toJSON();
    // Safely parse year, handling "1", "2", "3", "4" or strings
    let yearStr = obj.year;
    if (yearStr === '2') yearStr = '2nd';
    if (yearStr === '3') yearStr = '3rd';
    if (yearStr === '4') yearStr = 'Final';

    return {
      id: obj.id.toString(),
      photos: {
        studentPhoto: obj.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(obj.firstName + ' ' + obj.lastName)}&background=random`,
        familyPhoto: ''
      },
      basicInfo: {
        name: `${obj.firstName} ${obj.lastName}`,
        admissionNumber: obj.studentId || '',
        rollNumber: obj.rollNumber || '',
        registerNumber: obj.rollNumber || '',
        fullName: `${obj.firstName} ${obj.lastName}`,
        department: obj.department ? obj.department.short_name : '',
        year: yearStr,
        semester: obj.semester?.toString() || '',
        batch: obj.batch || '',
        admissionDate: '',
        natureOfResidence: ''
      },
      personalInfo: {
        dob: '',
        gender: obj.gender || '',
        bloodGroup: '',
        motherTongue: '',
        email: obj.email || '',
        linkedin: '',
        mobile: obj.phone || '',
        alternateMobile: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      },
      academicInfo: obj.bio?.academics || {
        cgpa: '0.0',
        arrears: 0,
        attendance: '0%'
      },
      parentInfo: {
        fatherName: '',
        fatherOccupation: '',
        fatherPhone: '',
        motherName: '',
        motherOccupation: '',
        motherPhone: '',
        siblings: []
      },
      referenceInfo: {
        name: '',
        phone: '',
        address: '',
        occupation: ''
      },
      documents: {},
      records: obj.bio?.records || [],
      extraCurricular: obj.bio?.extraCurricular || [],
      pendingChanges: []
    };
  });

  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
});

// @route   GET /api/v1/faculty/mentorship/student/:studentId
// @desc    Get specific mentee's details including bio
// @access  Private (Faculty)
export const getMenteeDetails = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;
  const { studentId } = req.params;
  const { academic_year } = req.query;

  // Verify the student is assigned to this faculty
  const isAssigned = await MentorAllocation.findOne({
    where: { faculty_id: facultyId, student_id: studentId, academic_year, status: 'active' }
  });

  if (!isAssigned) {
    return next(new ErrorResponse('You are not authorized to view this student or assignment is inactive', 403));
  }

  const student = await Student.findByPk(studentId, {
    include: [
      { model: Department, as: 'department', attributes: ['full_name', 'short_name'] },
      { model: StudentBio, as: 'bio' } // Assuming 'bio' is the association alias
    ]
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @route   PUT /api/v1/faculty/mentorship/student/:studentId
// @desc    Update mentee details (basic profile or bio)
// @access  Private (Faculty, Dept Admin)
export const updateMenteeDetails = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const updates = req.body;

  // Verify the student exists
  const student = await Student.findByPk(studentId);
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Update profile fields if provided
  const profileFields = ['firstName', 'lastName', 'email', 'phone'];
  let profileUpdated = false;
  for (const field of profileFields) {
    if (updates[field] !== undefined) {
      student[field] = updates[field];
      profileUpdated = true;
    }
  }
  if (profileUpdated) await student.save();

  // Update bio fields if provided
  let studentBio = await StudentBio.findOne({ where: { studentId } });
  if (!studentBio) {
    studentBio = await StudentBio.create({ studentId });
  }

  const bioFields = ['academics', 'records', 'extraCurricular', 'parentInfo', 'references', 'alternatePhone'];
  let bioUpdated = false;
  for (const field of bioFields) {
    if (updates[field] !== undefined) {
      studentBio[field] = updates[field];
      bioUpdated = true;
    }
  }
  if (bioUpdated) await studentBio.save();

  res.status(200).json({
    success: true,
    message: 'Mentee details updated successfully'
  });
});
