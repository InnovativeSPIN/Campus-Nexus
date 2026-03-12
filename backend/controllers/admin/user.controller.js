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
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const photoPath = req.file.path.replace(/\\/g, '/');

  // check users table
  let user = await User.findByPk(req.params.id);
  if (user) {
    await User.update({ avatar: photoPath }, { where: { id: req.params.id } });
    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: photoPath
    });
  }

  // check faculty table
  const faculty = await Faculty.findByPk(req.params.id);
  if (faculty && parseInt(faculty.role_id, 10) === 7) {
    await Faculty.update({ profile_image_url: photoPath }, { where: { faculty_id: req.params.id } });
    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: photoPath
    });
  }

  return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
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
    include: [
      { model: Role, as: 'role', attributes: ['role_name'] },
      { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
    ],
    attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  if (user) {
    const pu = user.toJSON();
    pu.role = pu.role?.role_name || null;
    if (pu.department && typeof pu.department === 'object') {
      pu.department = pu.department.short_name || pu.department.full_name || null;
    }
    res.status(200).json({ success: true, data: pu });
    return;
  }

  // Check faculty table for department admins
  const faculty = await Faculty.findByPk(req.params.id, {
    include: [{ model: Department, as: 'department', attributes: ['short_name', 'full_name'] }]
  });

  if (faculty && parseInt(faculty.role_id, 10) === 7) {
    const fpu = faculty.toJSON();
    fpu.id = fpu.faculty_id;
    fpu.name = fpu.Name || fpu.name;
    fpu.role = 'department-admin';
    fpu.avatar = fpu.profile_image_url;
    if (fpu.department && typeof fpu.department === 'object') {
      fpu.department = fpu.department.short_name || fpu.department.full_name || null;
    }
    res.status(200).json({ success: true, data: fpu });
    return;
  }

  return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
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
      faculty_college_code: req.body.faculty_college_code || req.body.departmentCode || req.body.employee_code || null,
      Name: req.body.name || req.body.admin_name || req.body.Name || '',
      email: req.body.email,
      password: req.body.password || req.body.pwd || '123',
      role_id: 7,
      department_id,
      status: req.body.isActive === false ? 'inactive' : 'active',
      Anna_University_ID: req.body.Anna_University_ID || req.body.anna_university_id || null,
      AICTE_ID: req.body.AICTE_ID || req.body.aicte_id || null,
      employee_id: req.body.employee_id || null,
      orcid_id: req.body.orcid_id || null,
      designation: req.body.designation || null,
      phone_number: req.body.phone_number || req.body.phone || null,
      date_of_birth: req.body.date_of_birth || null,
      date_of_joining: req.body.date_of_joining || null,
      gender: req.body.gender || null,
      blood_group: req.body.blood_group || null,
      aadhar_number: req.body.aadhar_number || null,
      pan_number: req.body.pan_number || null,
      perm_address: req.body.perm_address || null,
      curr_address: req.body.curr_address || null,
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
  if (req.body.password) {
    delete req.body.password;
  }

  if (req.body.role) {
    const normalized = normalizeRoleName(req.body.role);
    const roleRecord = await Role.findOne({ where: { role_name: normalized } });
    if (roleRecord) {
      req.body.role_id = roleRecord.role_id;
    }
    delete req.body.role;
    if (!req.body.role_id) {
      return next(new ErrorResponse('Invalid role specified', 400));
    }
  }

  // Update user if exists
  let user = await User.findByPk(req.params.id);
  if (user) {
    await User.update(req.body, { where: { id: req.params.id } });
    user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role', attributes: ['role_name'] }],
      attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
    });
    const pu = user.toJSON();
    pu.role = pu.role?.role_name || null;
    return res.status(200).json({ success: true, data: pu });
  }

  // Update faculty if role is department-admin
  let faculty = await Faculty.findByPk(req.params.id);
  if (faculty && parseInt(faculty.role_id, 10) === 7) {
    // Map user fields to faculty fields
    const facultyUpdate = {
      Name: req.body.name || req.body.Name || faculty.Name,
      email: req.body.email || faculty.email,
      status: req.body.isActive === false ? 'inactive' : 'active',
    };

    const optionalFields = [
      'faculty_college_code', 'Anna_University_ID', 'AICTE_ID', 'employee_id',
      'orcid_id', 'designation', 'phone_number', 'date_of_birth', 'date_of_joining',
      'gender', 'blood_group', 'aadhar_number', 'pan_number', 'perm_address', 'curr_address'
    ];
    for (const f of optionalFields) {
      if (req.body[f] !== undefined) facultyUpdate[f] = req.body[f] || null;
    }
    // also accept phone as alias for phone_number
    if (req.body.phone && !req.body.phone_number) facultyUpdate.phone_number = req.body.phone;
    if (req.body.employee_code && !req.body.faculty_college_code) facultyUpdate.faculty_college_code = req.body.employee_code;

    if (req.body.department) {
      const dep = !isNaN(parseInt(req.body.department, 10))
        ? await Department.findByPk(req.body.department)
        : await Department.findOne({ where: { short_name: req.body.department } });
      if (dep) facultyUpdate.department_id = dep.id;
    }

    await Faculty.update(facultyUpdate, { where: { faculty_id: req.params.id } });
    faculty = await Faculty.findByPk(req.params.id, {
      include: [{ model: Department, as: 'department', attributes: ['short_name', 'full_name'] }]
    });

    const fpu = faculty.toJSON();
    fpu.id = fpu.faculty_id;
    fpu.name = fpu.Name;
    fpu.role = 'department-admin';
    return res.status(200).json({ success: true, data: fpu });
  }

  return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
});


// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (user) {
    await user.destroy();
    return res.status(200).json({ success: true, data: {} });
  }

  const faculty = await Faculty.findByPk(req.params.id);
  if (faculty && parseInt(faculty.role_id, 10) === 7) {
    await faculty.destroy();
    return res.status(200).json({ success: true, data: {} });
  }

  return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
});

// @desc      Deactivate user
// @route     PUT /api/v1/users/:id/deactivate
// @access    Private/Admin
export const deactivateUser = asyncHandler(async (req, res, next) => {
  // check users
  let user = await User.findByPk(req.params.id);
  if (user) {
    await User.update({ isActive: false }, { where: { id: req.params.id } });
    user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
    });
    return res.status(200).json({ success: true, data: user });
  }

  // check faculty
  const faculty = await Faculty.findByPk(req.params.id);
  if (faculty && parseInt(faculty.role_id, 10) === 7) {
    await Faculty.update({ status: 'inactive' }, { where: { faculty_id: req.params.id } });
    return res.status(200).json({ success: true, data: faculty });
  }

  return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
});

// @desc      Activate user
// @route     PUT /api/v1/users/:id/activate
// @access    Private/Admin
export const activateUser = asyncHandler(async (req, res, next) => {
  // check users
  let user = await User.findByPk(req.params.id);
  if (user) {
    await User.update({ isActive: true }, { where: { id: req.params.id } });
    user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'pwd', 'resetPasswordToken', 'resetPasswordExpire'] }
    });
    return res.status(200).json({ success: true, data: user });
  }

  // check faculty
  const faculty = await Faculty.findByPk(req.params.id);
  if (faculty && parseInt(faculty.role_id, 10) === 7) {
    await Faculty.update({ status: 'active' }, { where: { faculty_id: req.params.id } });
    return res.status(200).json({ success: true, data: faculty });
  }

  return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
});

// @desc      Get available roles
// @route     GET /api/v1/roles
// @access    Private/Admin (superadmin can fetch too)
export const getRoles = asyncHandler(async (req, res, next) => {
  let roles = await Role.findAll({ attributes: ['role_id', 'role_name'] });
  // filter out roles that should not be assignable via the UI
  roles = roles.filter(r => {
    const name = r.role_name.toLowerCase();
    return name !== 'faculty' && name !== 'student';
  });

  // deduplicate by role_name (defensive in case of accidental duplicates)
  const unique = [];
  roles.forEach(r => {
    const name = r.role_name.toLowerCase();
    if (!unique.some(u => u.role_name.toLowerCase() === name)) {
      unique.push(r);
    }
  });

  res.status(200).json({ success: true, data: unique });
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
