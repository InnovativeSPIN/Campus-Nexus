import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { models } from '../models/index.js';
import { Op } from 'sequelize';

const { StudentNotification, LeaveNotification, User } = models;

/**
 * ==============================================================
 * NOTIFICATION MANAGEMENT SYSTEM
 * ==============================================================
 * Handles creation and management of notifications for:
 * - Student leave approvals
 * - Faculty leave approvals
 * - Administrative alerts
 */

// @desc   Get all notifications for user
// @route  GET /api/v1/notifications
// @access Private
export const getNotifications = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    const notifications = await StudentNotification.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });

    res.status(200).json({
        success: true,
        total: notifications.count,
        count: notifications.rows.length,
        data: notifications.rows
    });
});

// @desc   Get unread notification count
// @route  GET /api/v1/notifications/unread/count
// @access Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const count = await StudentNotification.count({
        where: { user_id: userId, status: 'unread' }
    });

    res.status(200).json({
        success: true,
        unreadCount: count
    });
});

// @desc   Mark notification as read
// @route  PATCH /api/v1/notifications/:id/read
// @access Private
export const markAsRead = asyncHandler(async (req, res, next) => {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await StudentNotification.findByPk(notificationId);
    if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
    }

    if (notification.user_id !== userId) {
        return next(new ErrorResponse('Unauthorized', 403));
    }

    notification.status = 'read';
    await notification.save();

    res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
    });
});

// @desc   Delete notification
// @route  DELETE /api/v1/notifications/:id
// @access Private
export const deleteNotification = asyncHandler(async (req, res, next) => {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await StudentNotification.findByPk(notificationId);
    if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
    }

    if (notification.user_id !== userId) {
        return next(new ErrorResponse('Unauthorized', 403));
    }

    await notification.destroy();

    res.status(200).json({
        success: true,
        message: 'Notification deleted'
    });
});

// @desc   Mark all notifications as read
// @route  PATCH /api/v1/notifications/mark-all/read
// @access Private
export const markAllAsRead = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    await StudentNotification.update(
        { status: 'read' },
        { where: { user_id: userId, status: 'unread' } }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

/**
 * INTERNAL HELPER METHODS (Called from other controllers)
 * These should NOT be exposed as routes
 */

// Create notification for student leave event
export const notifyStudentLeaveEvent = async (event, data) => {
    try {
        const { userId, entityId, relatedData } = data;

        let title = '';
        let message = '';

        switch (event) {
            case 'leave_submitted':
                title = 'Leave Application Submitted';
                message = `Your ${relatedData.leaveType} leave application for ${relatedData.totalDays} days has been submitted.`;
                break;
            case 'leave_pending_approval':
                title = 'Leave Awaiting Approval';
                message = `Your ${relatedData.leaveType} leave is awaiting class incharge approval.`;
                break;
            case 'leave_approved_by_ci':
                title = 'Class Incharge Approved';
                message = `Your leave has been approved by ${relatedData.approverName}. Awaiting department admin approval.`;
                break;
            case 'leave_approved':
                title = 'Leave Approved';
                message = `Your ${relatedData.leaveType} leave has been approved by all required authorities.`;
                break;
            case 'leave_rejected':
                title = 'Leave Rejected';
                message = `Your ${relatedData.leaveType} leave has been rejected. Reason: ${relatedData.remarks || 'Not specified'}`;
                break;
            case 'leave_cancelled':
                title = 'Leave Application Cancelled';
                message = `Your ${relatedData.leaveType} leave application has been cancelled.`;
                break;
            default:
                return;
        }

        await StudentNotification.create({
            studentId: userId,
            title,
            message,
            type: 'leave',
            referenceId: entityId,
            referenceType: 'StudentLeave',
            isRead: false
        });
    } catch (error) {
        console.error('Error creating student notification:', error);
    }
};

// Create notification for faculty approver
export const notifyFacultyApprovalPending = async (data) => {
    try {
        const { facultyId, studentName, leaveType, totalDays, entityId } = data;

        const title = 'New Leave Application to Review';
        const message = `${studentName} has submitted a ${leaveType} leave request for ${totalDays} days requiring your approval.`;

        await LeaveNotification.create({
            leave_request_id: entityId,
            recipient_type: 'faculty',
            recipient_id: facultyId,
            notification_type: 'submitted',
            title,
            message,
            is_read: false
        });
    } catch (error) {
        console.error('Error creating faculty notification:', error);
    }
};

// Create notification for department admin approver
export const notifyDeptAdminApprovalPending = async (data) => {
    try {
        const { facultyId, studentName, leaveType, classInchargeName, entityId } = data;

        const title = 'Leave Application Ready for Final Approval';
        const message = `${studentName}'s ${leaveType} leave has been approved by ${classInchargeName} and awaits your final approval.`;

        await LeaveNotification.create({
            leave_request_id: entityId,
            recipient_type: 'department-admin',
            recipient_id: facultyId,
            notification_type: 'submitted',
            title,
            message,
            is_read: false
        });
    } catch (error) {
        console.error('Error creating department admin notification:', error);
    }
};
