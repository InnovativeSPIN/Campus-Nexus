import path from 'path';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import User from '../../models/User.model.js';
import Role from '../../models/Role.model.js';
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
      { model: Role, as: 'role', attributes: ['role_name'] }
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
    const data = users.map((u) => {
      const pu = u.toJSON();
      pu.role = pu.role?.role_name || null;
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

  // Check if adding a department admin (HOD)
  if (req.body.role_id) {
    const roleRec = await Role.findByPk(req.body.role_id);
    if (roleRec && roleRec.role_name === 'department-admin' && req.body.departmentCode) {
      const existingHOD = await User.findOne({
        where: {
          role_id: req.body.role_id,
          departmentCode: req.body.departmentCode
        }
      });

      if (existingHOD) {
        return next(new ErrorResponse(`Department ${req.body.departmentCode} already has a Head of Department (${existingHOD.name})`, 400));
      }
    }
  }

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

  // Check if updating to a department admin (HOD)
  if (req.body.role_id) {
    const roleRec = await Role.findByPk(req.body.role_id);
    if (roleRec && roleRec.role_name === 'department-admin' && req.body.departmentCode) {
      const existingHOD = await User.findOne({
        where: {
          role_id: req.body.role_id,
          departmentCode: req.body.departmentCode,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingHOD) {
        return next(new ErrorResponse(`Department ${req.body.departmentCode} already has a Head of Department (${existingHOD.name})`, 400));
      }
    }
  }

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
