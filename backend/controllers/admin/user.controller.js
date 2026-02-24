import path from 'path';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { User, Role, Faculty, Department } = models;
import { Op } from 'sequelize';

// @desc      Upload photo for user
// @route     PUT /api/v1/users/:id/photo
// @access    Private/Admin
export const uploadUserPhoto = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

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

  // Create custom filename
  file.name = `photo_${user.id}${path.parse(file.name).ext}`;

  try {
    const uploadPath = path.resolve(process.env.FILE_UPLOAD_PATH, 'avatars', file.name);

    await file.mv(uploadPath);

    const photoUrl = `/uploads/avatars/${file.name}`;

    await User.update({ avatar: photoUrl }, { where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      data: photoUrl
    });
  } catch (err) {
    console.error('File Upload Error:', err);
    return next(new ErrorResponse('Problem with file upload', 500));
  }
});

// helper to normalize role string to database name
const normalizeRoleName = (role) => {
  if (!role) return null;
  let rn = role.toString().toLowerCase();
  rn = rn.replace(/_/g, '-');
  // add "-admin" suffix for simple codes if missing and not faculty/student
  if (!rn.includes('admin') && rn !== 'faculty' && rn !== 'student') {
    rn = `${rn}-admin`;
  }
  return rn;
};

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    let where = {};
    let include = [
      { model: Role, as: 'role', attributes: ['role_name'] },
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
    ];
    // if query.role is supplied we leave include as-is; otherwise include still needed for mapping later

    // Filter by role (accepts either role_name or short code)
    if (req.query.role) {
      const normalized = normalizeRoleName(req.query.role) || req.query.role;
      if (normalized) {
        // use association filter
        where['$role.role_name$'] = normalized;
      }
    }

    // Filter by active status
    if (req.query.isActive) {
      where.isActive = req.query.isActive === 'true';
    }

    // Search by name or email
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    console.log('getUsers query where=', where, 'page/limit', page, limit);

    const total = await User.count({ where, include });
    const users = await User.findAll({
      where,
      include,
      offset: startIndex,
      limit,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
    });

    // map each user to include a flattened role property
    let data = users.map((u) => {
      const pu = u.toJSON();
      pu.role = pu.role?.role_name || null;
      // normalize department to use short_name if available
      if (pu.department && typeof pu.department === 'object') {
        pu.department = pu.department.short_name || pu.department.full_name || null;
      }
      return pu;
    });

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data
    });
  } catch (err) {
    console.error('Error in getUsers:', err);
    return next(err);
  }
});

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Role, as: 'role', attributes: ['role_name'] }],
    attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  if (user) {
    const pu = user.toJSON();
    pu.role = pu.role?.role_name || null;
    res.status(200).json({ success: true, data: pu });
    return;
  }

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  // resolve role string to id if necessary
  if (req.body.role) {
    const normalized = normalizeRoleName(req.body.role);
    const roleRecord = await Role.findOne({ where: { role_name: normalized } });
    if (roleRecord) {
      req.body.role_id = roleRecord.role_id;
    }
    delete req.body.role;
  }

  // after normalizing role we must have a role_id otherwise reject
  if (!req.body.role_id) {
    return next(new ErrorResponse('A valid admin role is required', 400));
  }

  // If the role corresponds to a department admin (role_id 7), create a
  // record in the faculty_profiles table instead of the users table. This
  // ensures department admins are stored with the faculty/profile model.
  if (parseInt(req.body.role_id, 10) === 7) {
    // determine department_id if provided (accepts id, short_name or full_name)
    let department_id = null;
    try {
      if (req.body.department) {
        const dep = !isNaN(parseInt(req.body.department, 10))
          ? await Department.findByPk(req.body.department)
          : await Department.findOne({ where: { short_name: req.body.department } }) || await Department.findOne({ where: { full_name: req.body.department } });
        if (dep) department_id = dep.id;
      } else if (req.body.departmentCode) {
        const dep2 = await Department.findOne({ where: { short_name: req.body.departmentCode } });
        if (dep2) department_id = dep2.id;
      }
    } catch (err) {
      console.warn('Department lookup failed:', err);
    }

    const facultyPayload = {
      faculty_college_code: req.body.departmentCode || req.body.faculty_college_code || null,
      Name: req.body.name || req.body.admin_name || req.body.Name || '',
      email: req.body.email,
      password: req.body.password || req.body.pwd || '123',
      role_id: 7,
      department_id,
      status: req.body.isActive === false ? 'inactive' : 'active'
    };

    const faculty = await Faculty.create(facultyPayload);

    const fpu = faculty.toJSON();
    // attach role name for consistency with user responses
    const roleRec = await Role.findByPk(7);
    fpu.role = roleRec?.role_name || 'department-admin';
    // provide an `id` field to match frontend expectations (some front-end code
    // expects `id` or `_id` properties for created records)
    fpu.id = fpu.faculty_id;

    res.status(201).json({ success: true, data: fpu });
    return;
  }

  // previously we ensured a department did not have more than one HOD by
  // checking departmentCode. the users table doesn't currently store a
  // departmentCode/dept column, so skip this validation until the schema is
  // updated.

  const user = await User.create(req.body);

  // attach flattened role name
  const pu = user.toJSON();
  if (req.body.role_id) {
    const r = await Role.findByPk(req.body.role_id);
    pu.role = r?.role_name;
  }

  res.status(201).json({
    success: true,
    data: pu
  });
});

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  // Prevent password update through this route
  if (req.body.password) {
    delete req.body.password;
  }

  // resolve role if provided
  if (req.body.role) {
    const normalized = normalizeRoleName(req.body.role);
    const roleRecord = await Role.findOne({ where: { role_name: normalized } });
    if (roleRecord) {
      req.body.role_id = roleRecord.role_id;
    }
    delete req.body.role;
    // if a string role was given but we didn't find a matching id, it's invalid
    if (!req.body.role_id) {
      return next(new ErrorResponse('Invalid role specified', 400));
    }
  }

  // skip HOD uniqueness check since departmentCode isn't stored in users table

  await User.update(req.body, { where: { id: req.params.id } });
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Role, as: 'role', attributes: ['role_name'] }],
    attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const pu = user.toJSON();
  pu.role = pu.role?.role_name || null;

  res.status(200).json({
    success: true,
    data: pu
  });
});


// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await user.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Deactivate user
// @route     PUT /api/v1/users/:id/deactivate
// @access    Private/Admin
export const deactivateUser = asyncHandler(async (req, res, next) => {
  await User.update({ isActive: false }, { where: { id: req.params.id } });
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Activate user
// @route     PUT /api/v1/users/:id/activate
// @access    Private/Admin
export const activateUser = asyncHandler(async (req, res, next) => {
  await User.update({ isActive: true }, { where: { id: req.params.id } });
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Get available roles
// @route     GET /api/v1/roles
// @access    Private/Admin (superadmin can fetch too)
export const getRoles = asyncHandler(async (req, res, next) => {
  const roles = await Role.findAll({ attributes: ['role_id', 'role_name'] });
  res.status(200).json({ success: true, data: roles });
});

// @desc      Get users by role
// @route     GET /api/v1/users/role/:role
// @access    Private/Admin
export const getUsersByRole = asyncHandler(async (req, res, next) => {
  const roleName = normalizeRoleName(req.params.role) || req.params.role;
  const users = await User.findAll({
    where: { isActive: true, '$role.role_name$': roleName },
    include: [{ model: Role, as: 'role', attributes: ['role_name'] }],
    attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  const data = users.map(u => {
    const pu = u.toJSON();
    pu.role = pu.role?.role_name;
    return pu;
  });

  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

// @desc      Get admin dashboard stats
// @route     GET /api/v1/users/stats/dashboard
// @access    Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.count();
  const totalFaculty = await User.count({
    include: [{ model: Role, as: 'role', where: { role_name: 'faculty' } }]
  });
  const totalStudents = await User.count({
    include: [{ model: Role, as: 'role', where: { role_name: 'student' } }]
  });
  const activeUsers = await User.count({ where: { isActive: true } });
  const inactiveUsers = await User.count({ where: { isActive: false } });

  const recentUsers = await User.findAll({
    include: [{ model: Role, as: 'role', attributes: ['role_name'] }],
    order: [['createdAt', 'DESC']],
    limit: 5,
    attributes: ['name', 'email', 'createdAt']
  });

  const recentMapped = recentUsers.map(u => {
    const pu = u.toJSON();
    pu.role = pu.role?.role_name;
    return pu;
  });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalFaculty,
      totalStudents,
      activeUsers,
      inactiveUsers,
      recentUsers: recentMapped
    }
  });
});
