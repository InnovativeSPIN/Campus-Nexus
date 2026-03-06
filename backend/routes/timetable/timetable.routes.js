import express from 'express';
import {
  getAllTimetables,
  getTimetable,
  getTimetableByClass,
  getTimetableByFaculty,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  addSlot,
  updateSlot,
  removeSlot,
  getPeriodConfigs,
  createPeriodConfig,
  getTodaySchedule,
  getFacultyByYear,
  getFacultyTimetable,
  getTimetableByDepartmentAndYear,
  applyTimetableAlteration
} from '../../controllers/timetable/timetable.controller.js';

import { bulkUploadTimetable, getPersonalTimetable, getMyTimetable, getMyStudentTimetable } from '../../controllers/timetable/timetable-bulk.controller.js';

import { protect, authorize } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

// Multer error handler for bulk upload
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer error in route:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size exceeds limit' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
};

// All routes require authentication
router.use(protect);

// Get today's schedule for logged in user
router.get('/today', getTodaySchedule);

// Department Admin Routes - Faculty personal timetable (simpler paths)
router.get('/year/:year/faculties', authorize('department-admin'), getFacultyByYear);

// Department Admin Routes - Faculty personal timetable (admin-specific paths)
router.get('/admin/faculty-by-year/:year', authorize('department-admin'), getFacultyByYear);
router.get('/admin/faculty-timetable/:facultyId', authorize('department-admin'), getFacultyTimetable);

// Bulk upload timetable (with file upload)
router.post('/bulk-upload', upload.single('file'), handleMulterError, bulkUploadTimetable);

// Get personal timetable for logged-in faculty (protected, faculty role only)
router.get('/faculty/me', authorize('faculty'), getMyTimetable);

// Get personal timetable for logged-in student (protected, student role only)
router.get('/student/me', authorize('student'), getMyStudentTimetable);

// Get personal timetable for a faculty
router.get('/personal/:facultyId', getPersonalTimetable);

// Period configuration routes
router.route('/config/periods')
  .get(getPeriodConfigs)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), createPeriodConfig);

// Get timetable by class or faculty
router.get('/class/:classId', getTimetableByClass);
router.get('/faculty/:facultyId', getTimetableByFaculty);

// Main timetable routes
router.route('/')
  .get(getAllTimetables)
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), createTimetable);

router.route('/:id')
  .get(getTimetable)
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateTimetable)
  .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), deleteTimetable);

// Slot management routes
router.route('/:id/slots')
  .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), addSlot);

router.route('/:id/slots/:slotId')
  .put(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateSlot)
  .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), removeSlot);

// Get timetable by department and year (for timetable alteration)
router.get('/department/:year', authorize('faculty', 'department-admin'), getTimetableByDepartmentAndYear);

// Apply timetable alteration
router.post('/alteration', authorize('faculty', 'department-admin'), applyTimetableAlteration);

export default router;
