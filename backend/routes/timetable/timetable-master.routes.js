import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  createTimetableMaster,
  getTimetableMasters,
  getTimetableMaster,
  updateTimetableMaster,
  activateTimetableMaster,
  deactivateTimetableMaster,
  deleteTimetableMaster,
} from '../../controllers/timetable/timetable-master.controller.js';
import {
  getBreakConfiguration,
  saveBreakConfiguration,
} from '../../controllers/timetable/timetable-slots.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * Timetable Master Routes
 * Role: department-admin (role_id = 7) or timetable-incharge (role_id = 5 + is_timetable_incharge = 1)
 */

// Get all timetable masters
router.get('/', getTimetableMasters);

// Get single timetable master
router.get('/:id', getTimetableMaster);

// Create new timetable master (Department Admin only)
router.post('/', authorize('department-admin'), createTimetableMaster);

// Update timetable master (coordinator assignments)
router.patch('/:id', authorize('department-admin', 'timetable-incharge'), updateTimetableMaster);

// Activate timetable master
router.patch('/:id/activate', authorize('department-admin', 'timetable-incharge'), activateTimetableMaster);

// Deactivate timetable master
router.patch('/:id/deactivate', authorize('department-admin', 'timetable-incharge'), deactivateTimetableMaster);

// Delete timetable master (only draft)
router.delete('/:id', authorize('department-admin', 'timetable-incharge'), deleteTimetableMaster);

// Break configuration endpoints
router.get('/:masterId/break-config', getBreakConfiguration);
router.post('/:masterId/break-config', authorize('department-admin', 'faculty'), saveBreakConfiguration);

export default router;
