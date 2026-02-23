import express from 'express';
import {
  checkTimetableIncharge,
  getTimetablesByDepartmentAndYear,
  createTimetable,
  updateTimetable,
  assignFacultyToSlot,
  changeFacultyAssignment,
  getAvailableFacultyForClass,
  getSlotAssignments,
  deleteSlotAssignment,
  publishTimetable
} from '../../controllers/department-admin/timetable-management.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication and department admin role
router.use(protect);
router.use(checkTimetableIncharge);

// Timetable CRUD routes
router.get('/department/:year', getTimetablesByDepartmentAndYear);
router.post('/create', createTimetable);
router.put('/:id', updateTimetable);
router.post('/:timetable_id/publish', publishTimetable);

// Slot assignment routes
router.get('/:timetable_id/slots', getSlotAssignments);
router.post('/slots/assign', assignFacultyToSlot);
router.put('/slots/:assignment_id/reassign', changeFacultyAssignment);
router.delete('/slots/:assignment_id', deleteSlotAssignment);

// Faculty availability routes
router.get('/slots/available-faculty', getAvailableFacultyForClass);

export default router;
