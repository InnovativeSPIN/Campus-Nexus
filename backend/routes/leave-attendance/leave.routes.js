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
  getPendingCount,
  getPendingLeaves
} from '../../controllers/leave-attendance/leave.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/my-leaves', getMyLeaves);
router.get('/balance', getLeaveBalance);
router.get('/pending-approvals', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), getPendingLeaves);
router.put('/:id/cancel', cancelLeave);

// Admin routes
router.get('/pending-count', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), getPendingCount);

// Main routes
router.route('/')
  .get(getAllLeaves)
  .post(createLeave);

router.route('/:id')
  .get(getLeave)
  .put(updateLeave)
  .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), deleteLeave);

router.put('/:id/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), updateLeaveStatus);

export default router;
