import express from 'express';
import {
  getAllAttendance,
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByClass,
  getStudentAttendance,
  getMyAttendance,
  markFacultyAttendance,
  getFacultyAttendance,
  getAttendanceStats
} from '../../controllers/leave-attendance/attendance.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student route
router.get('/my-attendance', authorize('student'), getMyAttendance);

// Stats route
router.get('/stats', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), getAttendanceStats);

// Class and student attendance routes
router.get('/class/:classId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getAttendanceByClass);
router.get('/student/:studentId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'student'), getStudentAttendance);

// Faculty attendance routes
router.route('/faculty')
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), markFacultyAttendance);
router.get('/faculty/:facultyId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getFacultyAttendance);

// Main routes
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getAllAttendance)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), markAttendance);

router.route('/:id')
  .get(getAttendance)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), updateAttendance)
  .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), deleteAttendance);

export default router;
