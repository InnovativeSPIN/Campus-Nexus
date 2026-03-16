import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Mark all as read
router.patch('/mark-all/read', markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
