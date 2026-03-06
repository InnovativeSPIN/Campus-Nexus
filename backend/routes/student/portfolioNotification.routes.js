import express from 'express';
import {
    getMyPortfolioNotifications,
    markAsRead,
    getUnreadCount
} from '../../controllers/student/portfolioNotification.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('faculty', 'admin'));

router.get('/', getMyPortfolioNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);

export default router;
