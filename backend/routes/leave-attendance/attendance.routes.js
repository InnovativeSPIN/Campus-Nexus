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
  getAttendanceStats,
  getFacultyTimetableSlots,
  getDepartmentAdminClassSlots
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

// Timetable-based slot routes (NEW)
router.get('/faculty/timetable/:date', authorize('faculty'), getFacultyTimetableSlots);
router.get('/department-admin/classes/:date', authorize('department-admin'), getDepartmentAdminClassSlots);

// Main routes
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), getAllAttendance)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), markAttendance)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), markAttendance);

router.route('/:id')
  .get(getAttendance)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), updateAttendance)
  .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), deleteAttendance);

export default router;
