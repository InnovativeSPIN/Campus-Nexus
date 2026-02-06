import express from 'express';
import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
  getStudentsByDepartment,
  updateStudentStatus,
  promoteStudents,
  getMyProfile,
  getStudentStats
} from '../../controllers/student/student.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student can access their own profile
router.get('/me/profile', authorize('student'), getMyProfile);

// Stats route
router.get('/stats', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), getStudentStats);

// Routes for admin and faculty
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getAllStudents)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), createStudent);

router.route('/:id')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'student'), getStudent)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateStudent)
  .delete(authorize('superadmin', 'super-admin'), deleteStudent);

router.get('/class/:classId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getStudentsByClass);
router.get('/department/:departmentId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getStudentsByDepartment);
router.put('/:id/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateStudentStatus);
router.put('/promote', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), promoteStudents);

export default router;
