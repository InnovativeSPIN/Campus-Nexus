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
  updateFacultyProfile,
  getMyTimetable,
  getMyClassIncharge,
  getMyTimetableRoles,
  getDepartmentColleagues,
  getMySubjects
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
import {
  getMyEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory
} from '../../controllers/faculty/events.controller.js';
import {
  getMyResearch,
  addResearch,
  updateResearch,
  deleteResearch
} from '../../controllers/faculty/research.controller.js';
import { handleDownloadProfile } from '../../controllers/faculty/handleDownloadProfile.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Faculty, department-admins, and executive admins can access their own profile
router.get('/me/profile', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyProfile);
// Faculty class incharge - get assigned class and students
router.get('/me/class-incharge', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyClassIncharge);
// Faculty timetable roles (class coordinator / timetable incharge)
router.get('/me/timetable-roles', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyTimetableRoles);
// Faculty department colleagues - for leave reassign dropdown
router.get('/me/department-colleagues', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getDepartmentColleagues);
// Faculty subjects
router.get('/me/subjects', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMySubjects);
// Faculty can get their timetable
router.get('/my-timetable', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyTimetable);
// Faculty and executive admins can update their own profile
router.put('/update-profile', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), updateFacultyProfile);
// Route to download profile as DOCX (allow department-admin alongside faculty)
router.post('/download-profile', authorize('faculty', 'department-admin', 'superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), handleDownloadProfile);

// Routes for admin
router.route('/')
  .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'department-admin'), getAllFaculty)
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
  .get(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyEducation)
  .post(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), addEducation);

router.route('/education/:id')
  .put(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), updateEducation)
  .delete(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), deleteEducation);

// Experience routes
router.route('/experience')
  .get(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyExperience)
  .post(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), addExperience);

router.route('/experience/:id')
  .put(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), updateExperience)
  .delete(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), deleteExperience);

// Industry experience (separate table)
router.route('/experience/industry')
  .get(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyIndustryExperience)
  .post(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), addIndustryExperience);

router.route('/experience/industry/:id')
  .put(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), updateIndustryExperience)
  .delete(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), deleteIndustryExperience);

import {
  getMyPhd,
  addPhd,
  updatePhd,
  deletePhd
} from '../../controllers/faculty/phd.controller.js';

router.route('/phd')
  .get(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyPhd)
  .post(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), addPhd);

router.route('/phd/:id')
  .put(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), updatePhd)
  .delete(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), deletePhd);

// Events routes
router.route('/events')
  .get(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyEvents)
  .post(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), addEvent);

router.route('/events/:id')
  .put(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), updateEvent)
  .delete(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), deleteEvent);

router.get('/events/category/:category', authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getEventsByCategory);

// Research routes
router.route('/research')
  .get(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), getMyResearch)
  .post(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), addResearch);

router.route('/research/:id')
  .put(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), updateResearch)
  .delete(authorize('faculty', 'department-admin', 'executiveadmin', 'superadmin'), deleteResearch);

export default router;
