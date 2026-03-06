import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { PortfolioNotification, Student } = models;

// @desc   Get portfolio notifications for current faculty
// @route  GET /api/student/portfolio-notifications
// @access Private/Faculty
export const getMyPortfolioNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await PortfolioNotification.findAll({
        where: { recipientId: req.user.id },
        include: [
            {
                model: Student,
                as: 'sender',
                attributes: ['id', 'studentId', 'firstName', 'lastName']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
    });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
});

// @desc   Mark notification as read
// @route  PUT /api/student/portfolio-notifications/:id/read
// @access Private/Faculty
export const markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await PortfolioNotification.findOne({
        where: { id: req.params.id, recipientId: req.user.id }
    });

    if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
    }

    await notification.update({ isRead: true });
    res.status(200).json({ success: true, data: notification });
});

// @desc   Get unread count
// @route  GET /api/student/portfolio-notifications/unread-count
// @access Private/Faculty
export const getUnreadCount = asyncHandler(async (req, res, next) => {
    const count = await PortfolioNotification.count({
        where: { recipientId: req.user.id, isRead: false }
    });

    res.status(200).json({ success: true, count });
});
