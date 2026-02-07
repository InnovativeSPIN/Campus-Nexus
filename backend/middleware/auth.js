import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.model.js';

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
    if (decoded.id === '507f1f77bcf86cd799439011') {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
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

    req.user = await User.findById(decoded.id);

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
