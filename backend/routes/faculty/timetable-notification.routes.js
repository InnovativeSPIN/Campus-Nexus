import express from 'express';
import {
  getPendingNotifications,
  getAllNotifications,
  getNotificationDetails,
  acceptAssignment,
  rejectAssignment,
  markNotificationAsRead,
  getUnreadCount,
  markAllAsRead,
  getNotificationSummary
} from '../../controllers/faculty/timetable-notification.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All routes require faculty authentication
router.use(protect);

// Notification routes
router.get('/pending', getPendingNotifications);
router.get('/all', getAllNotifications);
router.get('/summary', getNotificationSummary);
router.get('/unread/count', getUnreadCount);
router.get('/:notification_id', getNotificationDetails);
router.put('/:notification_id/read', markNotificationAsRead);
router.put('/mark-all/read', markAllAsRead);

// Response routes
router.post('/:notification_id/accept', acceptAssignment);
router.post('/:notification_id/reject', rejectAssignment);

export default router;
