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
  uploadFaculty,
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

// Faculty and department-admins can access their own profile
router.get('/me/profile', authorize('faculty', 'department-admin'), getMyProfile);
// Faculty and department-admins can update their own profile
router.put('/update-profile', authorize('faculty', 'department-admin'), updateFacultyProfile);
// Route to download profile as DOCX (allow department-admin alongside faculty)
router.post('/download-profile', authorize('faculty', 'department-admin', 'superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), handleDownloadProfile);

// Routes for admin
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getAllFaculty)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), createFaculty);

router.route('/:id(\\d+)')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getFaculty)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateFaculty)
  .delete(authorize('superadmin', 'super-admin'), deleteFaculty);

router.post('/upload', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), uploadFaculty);

router.get('/department/:departmentId', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), getFacultyByDepartment);
router.put('/:id(\\d+)/subjects', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), assignSubjects);
router.put('/:id(\\d+)/classes', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), assignClasses);
router.put('/:id(\\d+)/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateFacultyStatus);

// Education routes
router.route('/education')
  .get(authorize('faculty', 'department-admin'), getMyEducation)
  .post(authorize('faculty', 'department-admin'), addEducation);

router.route('/education/:id')
  .put(authorize('faculty', 'department-admin'), updateEducation)
  .delete(authorize('faculty', 'department-admin'), deleteEducation);

// Experience routes
router.route('/experience')
  .get(authorize('faculty', 'department-admin'), getMyExperience)
  .post(authorize('faculty', 'department-admin'), addExperience);

router.route('/experience/:id')
  .put(authorize('faculty', 'department-admin'), updateExperience)
  .delete(authorize('faculty', 'department-admin'), deleteExperience);

// Industry experience (separate table)
router.route('/experience/industry')
  .get(authorize('faculty', 'department-admin'), getMyIndustryExperience)
  .post(authorize('faculty', 'department-admin'), addIndustryExperience);

router.route('/experience/industry/:id')
  .put(authorize('faculty', 'department-admin'), updateIndustryExperience)
  .delete(authorize('faculty', 'department-admin'), deleteIndustryExperience);

// PhD records
import {
  getMyPhd,
  addPhd,
  updatePhd,
  deletePhd
} from '../../controllers/faculty/phd.controller.js';

router.route('/phd')
  .get(authorize('faculty', 'department-admin'), getMyPhd)
  .post(authorize('faculty', 'department-admin'), addPhd);

router.route('/phd/:id')
  .put(authorize('faculty', 'department-admin'), updatePhd)
  .delete(authorize('faculty', 'department-admin'), deletePhd);

export default router;
