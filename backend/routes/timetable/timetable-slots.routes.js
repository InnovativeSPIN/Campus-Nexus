import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  createSlot,
  getSlots,
  updateSlot,
  deleteSlot,
  bulkCreateSlots,
} from '../../controllers/timetable/timetable-slots.controller.js';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

/**
 * Timetable Slots Routes
 * Base: /api/timetable-master/:masterId/slots
 */

// Get all slots for a timetable master
router.get('/', getSlots);

// Create a new slot
router.post('/', authorize('department-admin'), createSlot);

// Bulk create/update slots
router.post('/bulk', authorize('department-admin'), bulkCreateSlots);

// Update a slot
router.patch('/:slotId', authorize('department-admin'), updateSlot);

// Delete a slot
router.delete('/:slotId', authorize('department-admin'), deleteSlot);

export default router;
