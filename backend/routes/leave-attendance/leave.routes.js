import express from 'express';
import {
  getAllLeaves,
  getLeave,
  createLeave,
  updateLeave,
  updateLeaveStatus,
  cancelLeave,
  deleteLeave,
  getMyLeaves,
  getLeaveBalance,
  getPendingCount
} from '../../controllers/leave-attendance/leave.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/my-leaves', getMyLeaves);
router.get('/balance', getLeaveBalance);
router.put('/:id/cancel', cancelLeave);

// Admin routes
router.get('/pending-count', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), getPendingCount);

// Main routes
router.route('/')
  .get(getAllLeaves)
  .post(createLeave);

router.route('/:id')
  .get(getLeave)
  .put(updateLeave)
  .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), deleteLeave);

router.put('/:id/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'), updateLeaveStatus);

export default router;
