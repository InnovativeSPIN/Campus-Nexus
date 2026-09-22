import express from 'express';
import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  changePassword,
  getStudentsByClass,
  getStudentsByDepartment,
  updateStudentStatus,
  promoteStudents,
  getMyProfile,
  updateMyProfile,
  getStudentStats,
  getAcademicYears,
  uploadStudentPhoto,
  uploadFamilyPhoto,
  uploadReferencePhoto,
  uploadStudentPhotoAdmin,
  downloadBulkTemplate,
  bulkUploadStudents
} from '../../controllers/student/student.controller.js';

import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student can access their own profile
router.route('/me/profile')
  .get(authorize('student'), getMyProfile)
  .put(authorize('student'), updateMyProfile);

// Student can upload their own photo
router.put('/me/photo', authorize('student'), studentUpload.single('photo'), uploadStudentPhoto);

// Student can upload their family photo
router.put('/me/family-photo', authorize('student'), studentUpload.single('familyPhoto'), uploadFamilyPhoto);

// Student can upload their reference person's photo
router.post('/me/reference-photo', authorize('student'), studentUpload.single('referencePhoto'), uploadReferencePhoto);

// fetch academic years (batches) for dropdowns
router.get('/academic-years', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), getAcademicYears);

// Bulk upload routes
router.get('/bulk/template', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), downloadBulkTemplate);
router.post('/bulk/upload', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), studentUpload.single('file'), bulkUploadStudents);

// Stats route
router.get('/stats', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), getStudentStats);

// Specific student routes (must come BEFORE generic /:id route)
router.get('/class/:classId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), getStudentsByClass);
router.get('/department/:departmentId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), getStudentsByDepartment);
router.put('/promote', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), promoteStudents);

// Admin can upload student photo
router.put('/:id/photo', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), studentUpload.single('photo'), uploadStudentPhotoAdmin);

// Specific :id routes (must come BEFORE generic /:id route)
router.put('/:id/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateStudentStatus);
router.put('/:id/change-password', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), changePassword);

// Generic routes for admin and faculty
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'secretary', 'principal'), getAllStudents)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), createStudent);

// Generic :id route (must come LAST)
router.route('/:id')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'student', 'secretary'), getStudent)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateStudent)
  .delete(authorize('superadmin', 'super-admin'), deleteStudent);

export default router;
