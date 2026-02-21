import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import sendEmail from '../../utils/sendEmail.js';
import sendTokenResponse from '../../utils/sendTokenResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/db.js';

const { User, Role, Student, Faculty } = models;

// @desc      Upload avatar
// @route     POST /api/v1/auth/avatar
// @access    Private
export const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Determine user type and folder
  let userType = 'admin';
  let roleFolder = 'avatars';
  let userName = req.user.name || req.user.Name || req.user.firstName || 'user';

  if (req.user.userType === 'faculty' || req.user.faculty_id) {
    userType = 'faculty';
    roleFolder = 'faculty';
    userName = req.user.Name || req.user.name || 'faculty';
  } else if (req.user.role === 'student' || req.user.studentId) {
    userType = 'student';
    roleFolder = 'students';
    userName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
  } else if (req.user.role && (typeof req.user.role === 'object' && req.user.role.role_name === 'faculty')) {
    userType = 'faculty';
    roleFolder = 'faculty';
  } else if (req.user.role && (typeof req.user.role === 'object' && req.user.role.role_name === 'student')) {
    userType = 'student';
    roleFolder = 'students';
  }

  // Get current avatar to delete old file
  let currentAvatar = null;
  if (userType === 'faculty') {
    currentAvatar = req.user.profile_image_url;
  } else if (userType === 'student') {
    currentAvatar = req.user.photo;
  } else {
    currentAvatar = req.user.avatar;
  }

  if (currentAvatar) {
    const oldFilePath = path.resolve(process.env.FILE_UPLOAD_PATH, currentAvatar.replace('/uploads/', ''));
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  // Create custom filename using name
  const cleanName = userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  file.name = `${cleanName}${path.parse(file.name).ext}`;

  try {
    const dirPath = path.resolve(process.env.FILE_UPLOAD_PATH, roleFolder);

    // Create directory if not exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const uploadPath = path.resolve(dirPath, file.name);

    await file.mv(uploadPath);

    const avatarUrl = `/uploads/${roleFolder}/${file.name}`;

    // Update the appropriate table based on user type
    if (userType === 'faculty') {
      await Faculty.update(
        { profile_image_url: avatarUrl },
        { where: { faculty_id: req.user.faculty_id } }
      );
    } else if (userType === 'student') {
      await Student.update(
        { photo: avatarUrl },
        { where: { id: req.user.id } }
      );
    } else {
      await User.update(
        { avatar: avatarUrl },
        { where: { id: req.user.id } }
      );
    }

    res.status(200).json({
      success: true,
      data: avatarUrl
    });
  } catch (err) {
    console.error('File Upload Error:', err);
    return next(new ErrorResponse('Problem with file upload', 500));
  }
});

// @desc      Upload student avatar
// @route     POST /api/v1/auth/student-avatar
// @access    Private (Student only)
export const uploadStudentAvatar = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Get student data for name and current photo
  const student = await Student.findByPk(req.user.id, { attributes: { exclude: ['userId'] } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Delete old photo if exists
  if (student.photo) {
    const oldFilePath = path.resolve(process.env.FILE_UPLOAD_PATH, student.photo.replace('/uploads/', ''));
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  // Create custom filename using student name
  const cleanName = `${student.firstName}_${student.lastName}`.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  file.name = `${cleanName}${path.parse(file.name).ext}`;

  try {
    const dirPath = path.resolve(process.env.FILE_UPLOAD_PATH, 'students');

    // Create directory if not exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const uploadPath = path.resolve(dirPath, file.name);

    await file.mv(uploadPath);

    const avatarUrl = `/uploads/students/${file.name}`;

    await Student.update({ photo: avatarUrl }, { where: { id: req.user.id } });

    res.status(200).json({
      success: true,
      data: avatarUrl
    });
  } catch (err) {
    console.error('File Upload Error:', err);
    return next(new ErrorResponse('Problem with file upload', 500));
  }
});

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, department } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role_id: role, // Assuming role is passed as id now? Wait, the body has role as string?
    phone,
    department
  });

  sendTokenResponse(user, 201, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  let user = null;
  let userType = null; // 'admin', 'faculty', or 'student'

  // 1. Check for faculty in faculty_profiles table FIRST (priority)
  user = await Faculty.findOne({
    where: { email },
    attributes: { include: ['password'] }
  });

  if (user) {
    const isMatch = await user.matchPassword(password);
    if (isMatch && user.status === 'active') {
      userType = 'faculty';
      return sendTokenResponse(user, 200, res);
    }
    // If password doesn't match or inactive, fall through to check other tables
    user = null;
  }

  // 2. Check for student in student_profile table (email or studentId)
  user = await Student.findOne({
    where: {
      [Op.or]: [
        { email },
        { studentId: email } // 'email' variable really holds the identifier string
      ]
    },
    attributes: { exclude: ['userId'] }
  });

  if (user) {
    const isMatch = await user.matchPassword(password);
    if (isMatch && user.status === 'active') {
      userType = 'student';
      return sendTokenResponse(user, 200, res);
    }
    // If password doesn't match or inactive, fall through to check admin
    user = null;
  }

  // 3. Check for admin user in users table (lowest priority)
  user = await User.findOne({
    where: { email },
    attributes: { include: ['password'] },
    include: [{ model: Role, as: 'role' }]
  });

  if (user) {
    if (!user.isActive) {
      return next(new ErrorResponse('Your account has been deactivated', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      userType = 'admin';
      return sendTokenResponse(user, 200, res);
    }
  }

  // If no user found or password doesn't match in any table
  return next(new ErrorResponse('Invalid credentials', 401));
});

// @desc      Login student
// @route     POST /api/v1/auth/student-login
// @access    Public
export const studentLogin = asyncHandler(async (req, res, next) => {
  let { studentId, password } = req.body;

  // allow sending either id or email under "studentId" field for backward compatibility
  const identifier = studentId?.toString().trim();

  // Validate identifier & password
  if (!identifier || !password) {
    return next(new ErrorResponse('Please provide student ID/email and password', 400));
  }

  // Check for student by id or email
  const student = await Student.findOne({
    where: {
      [Op.or]: [
        { studentId: identifier },
        { email: identifier }
      ]
    },
    attributes: { exclude: ['userId'] },
    include: [
      {
        model: models.Department,
        as: 'department',
        attributes: ['short_name', 'full_name']
      }
    ]
  });

  if (!student) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if student is active
  if (student.status !== 'active') {
    return next(new ErrorResponse('Your account has been deactivated', 401));
  }

  // Check if password matches
  const isMatch = await student.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Update last login (if we add this field later)
  // student.lastLogin = new Date();
  // await student.save();

  sendTokenResponse(student, 200, res);
});

// @desc      Get student details by student ID or email
// @route     GET /api/v1/auth/student-details/:identifier
// @access    Public
export const getStudentDetails = asyncHandler(async (req, res, next) => {
  const identifier = req.params.identifier; // may be actual studentId or email

  if (!identifier) {
    return next(new ErrorResponse('Please provide a student identifier', 400));
  }

  // Check for student by either ID or email
  const student = await Student.findOne({
    where: {
      [Op.or]: [
        { studentId: identifier },
        { email: identifier }
      ]
    },
    attributes: { exclude: ['userId'] },
    include: [
      {
        model: models.Department,
        as: 'department',
        attributes: ['short_name', 'full_name']
      }
    ]
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Return student details
  res.status(200).json({
    success: true,
    data: {
      name: `${student.firstName} ${student.lastName}`,
      rollNo: student.studentId,
      department: student.department?.short_name || student.department?.full_name,
      year: parseInt(student.year) || undefined,
      semester: student.semester
    }
  });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'pwd'] }
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  await User.update(fieldsToUpdate, { where: { id: req.user.id } });
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'pwd'] }
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { include: ['password'] }
  });

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Update student password
// @route     PUT /api/v1/auth/update-student-password
// @access    Private (Student only)
export const updateStudentPassword = asyncHandler(async (req, res, next) => {
  const student = await Student.findByPk(req.user.id, {
    attributes: { include: ['password'] }
  });

  // Check current password
  if (!(await student.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  student.password = req.body.newPassword;
  await student.save();

  sendTokenResponse(student, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    where: {
      resetPasswordToken,
      resetPasswordExpire: { [Op.gt]: new Date() }
    },
    attributes: { include: ['password'] }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  sendTokenResponse(user, 200, res);
});
// @desc      Get admins by role
// @route     GET /api/v1/auth/admins/:role
// @access    Public
export const getAdminsByRole = asyncHandler(async (req, res, next) => {
  let { role } = req.params;

  // Handle superadmin variations
  let roleNames = [role];
  if (role === 'superadmin') {
    roleNames = ['superadmin', 'super-admin'];
  }

  // Find the role_ids
  const roles = await Role.findAll({
    where: { role_name: { [Op.in]: roleNames } },
    attributes: ['role_id']
  });

  const roleIds = roles.map(r => r.role_id);

  const admins = await User.findAll({
    where: {
      role_id: { [Op.in]: roleIds }
    },
    attributes: ['name', 'email']
  });

  // Map results to ensure each has a 'name' field for the frontend
  const formattedAdmins = admins.map(admin => ({
    name: admin.name || 'Admin',
    email: admin.email
  }));

  res.status(200).json({
    success: true,
    data: formattedAdmins
  });
});
