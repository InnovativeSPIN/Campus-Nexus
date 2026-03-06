import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { models } from '../models/index.js';

const { User, Student, Faculty } = models;

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    // Accept Authorization header even if it doesn't use the Bearer scheme
    token = req.headers.authorization;
  } else if (req.headers['x-auth-token']) {
    // Accept a custom header often used by clients
    token = req.headers['x-auth-token'];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle dummy student access without DB
    if (decoded.id === 0) {
      req.user = {
        id: 0,
        name: 'Dummy Student',
        email: 'student@nscet.com',
        role: 'student',
        isActive: true,
        department: 'Computer Science',
        year: '3rd',
        semester: '6th',
        rollNo: 'NSC21CS001'
      };
      return next();
    }

    // Handle student tokens
    if (decoded.type === 'student') {
      req.user = await Student.findByPk(decoded.id, {
        attributes: { exclude: ['userId'] },
        include: [{
          model: models.Department,
          as: 'department',
          attributes: ['short_name', 'full_name']
        }]
      });

      if (!req.user) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
      }

      // Add role info for student and extract department code
      req.user.role = 'student';
      req.user.departmentCode = req.user.department?.short_name || null;
      // normalize department id properties for compatibility
      req.user.department_id = req.user.department_id || req.user.departmentId || req.user.department?.id || null;
      req.user.departmentId = req.user.department_id;
      return next();
    }

    // Handle faculty tokens
    if (decoded.type === 'faculty') {
      req.user = await Faculty.findByPk(decoded.id, {
        attributes: { exclude: ['userId'] },
        include: [{
          model: models.Department,
          as: 'department',
          attributes: ['short_name', 'full_name']
        }]
      });

      if (!req.user) {
        console.error(`[AUTH ERROR] Faculty record not found for ID: ${decoded.id}`);
        return next(new ErrorResponse('Not authorized to access this route', 401));
      }

      // Debug: Log the structure of the faculty object
      console.log('[AUTH DEBUG] Faculty object keys:', Object.keys(req.user.dataValues || req.user));
      console.log('[AUTH DEBUG] Faculty ID:', req.user.faculty_id, 'ID:', req.user.id);

      // Add role info for faculty and extract department code
      req.user.role = 'faculty';
      req.user.userType = 'faculty';
      req.user.departmentCode = req.user.department?.short_name || null;
      // normalize department id and faculty id properties for compatibility
      req.user.department_id = req.user.department_id || req.user.departmentId || req.user.department?.id || null;
      req.user.departmentId = req.user.department_id;
      req.user.faculty_id = req.user.faculty_id || req.user.facultyId || req.user.id || null;
      req.user.id = req.user.faculty_id;

      console.log('[AUTH OK] Faculty logged in - ID:', req.user.id);
      return next();

    }

    // Handle department-admin tokens (issued for faculty with role_id = 7)
    if (decoded.type === 'department-admin') {
      req.user = await Faculty.findByPk(decoded.id, {
        attributes: { exclude: ['userId'] },
        include: [{
          model: models.Department,
          as: 'department',
          attributes: ['short_name', 'full_name']
        }]
      });

      if (!req.user) {
        console.error(`[AUTH ERROR] Department-admin faculty record not found for ID: ${decoded.id}`);
        return next(new ErrorResponse('Not authorized to access this route', 401));
      }

      // Mark role as department-admin so `authorize()` recognizes it
      req.user.role = 'department-admin';
      req.user.userType = 'faculty';
      req.user.departmentCode = req.user.department?.short_name || null;
      // normalize ids
      req.user.department_id = req.user.department_id || req.user.departmentId || req.user.department?.id || null;
      req.user.departmentId = req.user.department_id;
      req.user.faculty_id = req.user.faculty_id || req.user.facultyId || req.user.id || null;
      req.user.id = req.user.faculty_id;
      return next();
    }

    req.user = await User.findByPk(decoded.id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['role_name']
      }]
    });

    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // normalize role property so callers can treat it as string
    if (req.user.role && typeof req.user.role === 'object') {
      // sequelize returns an object with role_name; convert it
      req.user.role = req.user.role.role_name || '';
    }

    next();
  } catch (err) {
    console.error('Auth protect error:', err && err.message ? err.message : err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // Normalize user role: convert objects to strings, trim, lowercase,
    // and treat 'super-admin' as 'superadmin'.
    let userRoleRaw = req.user.role;
    if (userRoleRaw && typeof userRoleRaw === 'object' && userRoleRaw.role_name) {
      userRoleRaw = userRoleRaw.role_name;
    }
    if (typeof userRoleRaw !== 'string') {
      userRoleRaw = String(userRoleRaw);
    }

    const userRole = userRoleRaw.trim().toLowerCase().replace(/-/g, '');
    const normalizedUserRole = userRole;

    // Normalize allowed roles similarly
    const normalizedRoles = roles.map(role => {
      return role.trim().toLowerCase().replace(/-/g, '');
    });

    if (!normalizedRoles.includes(normalizedUserRole)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
