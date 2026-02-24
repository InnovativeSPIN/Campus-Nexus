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
  getMyProfile,
  updateFacultyProfile
} from '../../controllers/faculty/faculty.controller.js';
import {
  getMyEducation,
  addEducation,
  updateEducation,
  deleteEducation
} from '../../controllers/faculty/edu.controller.js';
import {
  getMyExperience,
  addExperience,
  updateExperience,
  deleteExperience
} from '../../controllers/faculty/exp.controller.js';
import {
  getMyIndustryExperience,
  addIndustryExperience,
  updateIndustryExperience,
  deleteIndustryExperience
} from '../../controllers/faculty/industry.controller.js';
import { handleDownloadProfile } from '../../controllers/faculty/handleDownloadProfile.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Faculty can access their own profile
router.get('/me/profile', authorize('faculty'), getMyProfile);
// Faculty can update their own profile
router.put('/update-profile', authorize('faculty'), updateFacultyProfile);
// Route to download profile as DOCX
router.post('/download-profile', authorize('faculty', 'superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), handleDownloadProfile);

// Routes for admin
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getAllFaculty)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), createFaculty);

router.route('/:id(\\d+)')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getFaculty)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateFaculty)
  .delete(authorize('superadmin', 'super-admin'), deleteFaculty);

router.get('/department/:departmentId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), getFacultyByDepartment);
router.put('/:id(\\d+)/subjects', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), assignSubjects);
router.put('/:id(\\d+)/classes', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), assignClasses);
router.put('/:id(\\d+)/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateFacultyStatus);

// Education routes
router.route('/education')
  .get(authorize('faculty'), getMyEducation)
  .post(authorize('faculty'), addEducation);

router.route('/education/:id')
  .put(authorize('faculty'), updateEducation)
  .delete(authorize('faculty'), deleteEducation);

// Experience routes
router.route('/experience')
  .get(authorize('faculty'), getMyExperience)
  .post(authorize('faculty'), addExperience);

router.route('/experience/:id')
  .put(authorize('faculty'), updateExperience)
  .delete(authorize('faculty'), deleteExperience);

// Industry experience (separate table)
router.route('/experience/industry')
  .get(authorize('faculty'), getMyIndustryExperience)
  .post(authorize('faculty'), addIndustryExperience);

router.route('/experience/industry/:id')
  .put(authorize('faculty'), updateIndustryExperience)
  .delete(authorize('faculty'), deleteIndustryExperience);

export default router;
