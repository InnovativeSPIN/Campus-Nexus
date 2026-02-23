import express from 'express';
import {
  getBreakTimingsByYear,
  getAllBreakTimings,
  createBreakTiming,
  updateBreakTiming,
  deleteBreakTiming,
  bulkCreateBreakTimings
} from '../../controllers/department-admin/break-timing.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Break timing routes
router.get('/year/:year', getBreakTimingsByYear);
router.get('/', getAllBreakTimings);
router.post('/create', createBreakTiming);
router.post('/bulk-create', bulkCreateBreakTimings);
router.put('/:id', updateBreakTiming);
router.delete('/:id', deleteBreakTiming);

export default router;
