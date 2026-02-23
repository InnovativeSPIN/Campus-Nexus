import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getTimetableAlterations,
  createTimetableAlteration,
  getTimetableAlterationDetails,
  updateTimetableAlteration,
  deleteTimetableAlteration,
  checkTimetableIncharge,
} from '../../controllers/faculty/timetable-alteration.controller.js';

const router = express.Router();

// All routes require authentication and faculty role
router.use(protect);
router.use(authorize('faculty'));

// Timetable alteration routes (only for timetable incharge)
router.use(checkTimetableIncharge);

router.get('/', getTimetableAlterations);
router.post('/', createTimetableAlteration);
router.get('/:id', getTimetableAlterationDetails);
router.put('/:id', updateTimetableAlteration);
router.delete('/:id', deleteTimetableAlteration);

export default router;
