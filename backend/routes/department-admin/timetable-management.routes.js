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
  publishTimetable,
  uploadTimetableCSV,
  getDepartmentFaculty
} from '../../controllers/department-admin/timetable-management.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication and department admin role
router.use(protect);

// Faculty list is used by the create timetable page; department-admins
// should be able to fetch active faculty even if they are not designated
// as timetable incharge.  Apply the extra check only after this route.
router.get('/faculty', getDepartmentFaculty);

// subsequent endpoints require timetable-incharge permission
router.use(checkTimetableIncharge);

// Timetable CRUD routes
router.get('/department/:year', getTimetablesByDepartmentAndYear);
router.post('/create', createTimetable);
router.post('/upload-csv', uploadTimetableCSV);
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
