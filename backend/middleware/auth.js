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
        include: [{
          model: models.Department,
          as: 'department',
          attributes: ['short_name', 'full_name']
        }]
      });

      if (!req.user) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
      }

      // Add role info for student
      req.user.role = 'student';
      return next();
    }

    // Handle faculty tokens
    if (decoded.type === 'faculty') {
      req.user = await Faculty.findByPk(decoded.id, {
        include: [{
          model: models.Department,
          as: 'department',
          attributes: ['short_name', 'full_name']
        }]
      });

      if (!req.user) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
      }

      // Add role info for faculty
      req.user.role = 'faculty';
      req.user.userType = 'faculty';
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

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // Normalize user role: trim, lowercase, and treat 'super-admin' as 'superadmin'
    const userRole = req.user.role.trim().toLowerCase();
    const normalizedUserRole = userRole === 'super-admin' ? 'superadmin' : userRole;

    // Normalize allowed roles similarly
    const normalizedRoles = roles.map(role => {
      const r = role.trim().toLowerCase();
      return r === 'super-admin' ? 'superadmin' : r;
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
