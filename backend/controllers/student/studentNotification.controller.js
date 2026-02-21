import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { StudentNotification, Student } = models;
import { Op } from 'sequelize';

const getStudentId = async (userOrId, next) => {
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get all notifications for logged-in student
// @route  GET /api/student/notifications?isRead=&type=
// @access Private/Student
export const getMyNotifications = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };
    if (req.query.isRead !== undefined) where.isRead = req.query.isRead === 'true';
    if (req.query.type) where.type = req.query.type;
    if (req.query.priority) where.priority = req.query.priority;

    // Exclude expired notifications
    where[Op.or] = [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }];

    const notifications = await StudentNotification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(req.query.limit) || 50
    });

    const unreadCount = await StudentNotification.count({ where: { studentId, isRead: false } });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
});

// @desc   Mark a single notification as read
// @route  PUT /api/student/notifications/:id/read
// @access Private/Student
export const markAsRead = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    await StudentNotification.markAsRead(req.params.id, studentId);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
});

// @desc   Mark all notifications as read
// @route  PUT /api/student/notifications/read-all
// @access Private/Student
export const markAllAsRead = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    await StudentNotification.markAllAsRead(studentId);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// @desc   Delete a single notification
// @route  DELETE /api/student/notifications/:id
// @access Private/Student
export const deleteNotification = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const notification = await StudentNotification.findOne({ where: { id: req.params.id, studentId } });
    if (!notification) return next(new ErrorResponse('Notification not found', 404));

    await notification.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Create notification for a student (internal/admin utility)
// @route  POST /api/student/notifications
// @access Private/Admin/Faculty
export const createNotification = asyncHandler(async (req, res, next) => {
    const notification = await StudentNotification.create(req.body);
    res.status(201).json({ success: true, data: notification });
});

// @desc   Bulk create notifications (e.g., broadcast to class)
// @route  POST /api/student/notifications/bulk
// @access Private/Admin/Faculty
export const bulkCreateNotifications = asyncHandler(async (req, res, next) => {
    const { studentIds, title, message, type, priority, actionUrl } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return next(new ErrorResponse('studentIds array is required', 400));
    }

    const notifications = studentIds.map(studentId => ({
        studentId,
        title,
        message,
        type: type || 'general',
        priority: priority || 'low',
        actionUrl: actionUrl || null
    }));

    const created = await StudentNotification.bulkCreate(notifications);
    res.status(201).json({ success: true, count: created.length, data: created });
});
