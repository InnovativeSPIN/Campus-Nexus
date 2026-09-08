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
  getPendingLeaves,
  getLeaveNotifications,
  getLeaveNotificationCount,
  markLeaveNotificationRead,
  markAllLeaveNotificationsRead,
  getReassignmentRequests,
  processReassignmentResponse,
} from '../../controllers/leave-attendance/leave.controller.js';



import { protect, authorize } from '../../middleware/auth.js';
import leaveUpload from '../../middleware/leaveUpload.js';


const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/my-leaves', getMyLeaves);
router.get('/balance', getLeaveBalance);
router.get('/reassignment-requests', getReassignmentRequests);
router.get('/pending-approvals', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'secretary'), getPendingLeaves);

router.put('/:id/cancel', cancelLeave);

// Admin routes
router.get('/pending-count', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'secretary'), getPendingCount);

// Leave notification routes
router.get('/notifications/unread-count', getLeaveNotificationCount);
router.put('/notifications/mark-all-read', markAllLeaveNotificationsRead);
router.get('/notifications', getLeaveNotifications);
router.put('/notifications/:id/read', markLeaveNotificationRead);

// Main routes
router.route('/')
  .get(getAllLeaves)
  .post(leaveUpload.single('document'), createLeave);


router.route('/:id')
  .get(getLeave)
  .put(updateLeave)
  .delete(deleteLeave);

router.put('/:id/reassignment-response', processReassignmentResponse);
router.put('/:id/status', authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), updateLeaveStatus);


export default router;
