import express from 'express';
import {
  getAllFaculty,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyByDepartment,
  assignSubjects,
  assignClasses,
  updateFacultyStatus,
  getMyProfile
} from '../../controllers/faculty/faculty.controller.js';
import { handleDownloadProfile } from '../../controllers/faculty/handleDownloadProfile.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Faculty can access their own profile
router.get('/me/profile', authorize('faculty'), getMyProfile);
// Route to download profile as DOCX
router.post('/download-profile', authorize('faculty', 'superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), handleDownloadProfile);

// Routes for admin
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getAllFaculty)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), createFaculty);

router.route('/:id')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getFaculty)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateFaculty)
  .delete(authorize('superadmin', 'super-admin'), deleteFaculty);

router.get('/department/:departmentId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), getFacultyByDepartment);
router.put('/:id/subjects', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), assignSubjects);
router.put('/:id/classes', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), assignClasses);
router.put('/:id/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateFacultyStatus);

export default router;
