import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getClassTimetable,
  getFacultyTimetable,
  getMyTimetable,
  getMyClassTimetable,
} from '../../controllers/timetable/timetable-display.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * Display Routes for Timetableviewing
 */

// Get class timetable (for students in that class)
router.get('/class/:classId', getClassTimetable);

// Get faculty timetable
router.get('/faculty/:facultyId', getFacultyTimetable);

// Get my timetable (logged-in faculty)
router.get('/my-timetable', authorize('faculty'), getMyTimetable);

// Get my class timetable (logged-in student)
router.get('/my-class-timetable', authorize('student'), getMyClassTimetable);

export default router;
