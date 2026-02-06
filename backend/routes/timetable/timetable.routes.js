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
  getTodaySchedule
} from '../../controllers/timetable/timetable.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get today's schedule for logged in user
router.get('/today', getTodaySchedule);

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

export default router;
