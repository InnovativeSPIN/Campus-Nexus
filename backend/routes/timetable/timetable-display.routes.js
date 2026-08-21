import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getClassTimetable,
  getFacultyTimetable,
  getMyTimetable,
  getMyClassTimetable,
  getEffectiveClassTimetable,
  getAllMasterPeriodSlots,
} from '../../controllers/timetable/timetable-display.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * Display Routes for Timetableviewing
 */

// Get all active period slots (real-time master period definitions)
router.get('/period-slots', getAllMasterPeriodSlots);

// Get class timetable (for students in that class)
router.get('/class/:classId', getClassTimetable);

// Get effective class timetable with alteration overlay for a specific date
router.get('/view/:classId', getEffectiveClassTimetable);

// Get faculty timetable
router.get('/faculty/:facultyId', getFacultyTimetable);

// Get my timetable (logged-in faculty)
router.get('/my-timetable', authorize('faculty'), getMyTimetable);

// Get my class timetable (logged-in student)
router.get('/my-class-timetable', authorize('student'), getMyClassTimetable);

export default router;
