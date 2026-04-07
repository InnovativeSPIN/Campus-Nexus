import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  createSlot,
  getSlots,
  updateSlot,
  deleteSlot,
  bulkCreateSlots,
  getSubjectsForTimetable,
  getFacultyForTimetable,
} from '../../controllers/timetable/timetable-slots.controller.js';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

/**
 * Timetable Slots Routes
 * Base: /api/v1/timetable-master/:masterId/slots
 *
 * GET /subjects  → dept-admin or faculty (same dept) – subjects for Add Slot dropdown
 * GET /faculty   → dept-admin or faculty (same dept) – faculty for Add Slot dropdown
 * GET /          → any authenticated user (dept access enforced in controller)
 * POST /         → dept-admin OR faculty (timetable_incharge, enforced in controller)
 * POST /bulk     → dept-admin OR faculty (timetable_incharge, enforced in controller)
 * PATCH /:slotId → dept-admin OR faculty (timetable_incharge, enforced in controller)
 * DELETE/:slotId → dept-admin OR faculty (timetable_incharge, enforced in controller)
 */

// Helper data endpoints – MUST come before /:slotId to avoid route conflicts
router.get('/subjects', authorize('department-admin', 'faculty'), getSubjectsForTimetable);
router.get('/faculty',  authorize('department-admin', 'faculty'), getFacultyForTimetable);

// Get all slots for a timetable master (open to any authenticated user; dept check in controller)
router.get('/', getSlots);

// Create a new slot
router.post('/', authorize('department-admin', 'faculty'), createSlot);

// Bulk create/replace slots
router.post('/bulk', authorize('department-admin', 'faculty'), bulkCreateSlots);

// Update a slot
router.patch('/:slotId', authorize('department-admin', 'faculty'), updateSlot);

// Delete a slot
router.delete('/:slotId', authorize('department-admin', 'faculty'), deleteSlot);

export default router;
