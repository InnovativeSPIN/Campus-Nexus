import models from '../../models/index.js';
import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';

/**
 * Get pending notifications for logged-in faculty
 */
export const getPendingNotifications = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;

  const notifications = await models.TimetableNotification.findAll({
    where: { faculty_id, status: 'pending' },
    include: [
      {
        model: models.Subject,
        attributes: ['id', 'name', 'code']
      },
      {
        model: models.Class,
        attributes: ['id', 'name', 'year']
      },
      {
        model: models.TimetableSlotAssignment,
        attributes: ['id', 'day_of_week', 'start_time', 'end_time', 'room_number']
      },
      {
        model: models.Faculty,
        as: 'requestedByFaculty',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: notifications,
    count: notifications.length
  });
});

/**
 * Get all notifications for a faculty (pending, accepted, rejected)
 */
export const getAllNotifications = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;
  const { status } = req.query;

  let where = { faculty_id };
  if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
    where.status = status;
  }

  const notifications = await models.TimetableNotification.findAll({
    where,
    include: [
      {
        model: models.Subject,
        attributes: ['id', 'name', 'code']
      },
      {
        model: models.Class,
        attributes: ['id', 'name', 'year']
      },
      {
        model: models.TimetableSlotAssignment,
        attributes: ['id', 'day_of_week', 'start_time', 'end_time', 'room_number']
      },
      {
        model: models.Faculty,
        as: 'requestedByFaculty',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: notifications,
    count: notifications.length
  });
});

/**
 * Get notification details by ID
 */
export const getNotificationDetails = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;
  const { notification_id } = req.params;

  const notification = await models.TimetableNotification.findOne({
    where: { id: notification_id, faculty_id },
    include: [
      {
        model: models.Subject,
        attributes: ['id', 'name', 'code']
      },
      {
        model: models.Class,
        attributes: ['id', 'name', 'year', 'semester']
      },
      {
        model: models.TimetableSlotAssignment,
        attributes: ['id', 'day_of_week', 'start_time', 'end_time', 'room_number', 'status'],
        include: [
          {
            model: models.Timetable,
            attributes: ['id', 'year', 'session_start', 'session_end']
          }
        ]
      },
      {
        model: models.Faculty,
        as: 'requestedByFaculty',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
      }
    ]
  });

  if (!notification) {
    throw new ErrorResponse('Notification not found', 404);
  }

  // Mark as read if not already
  if (!notification.is_read) {
    await notification.update({ is_read: true });
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * Accept a timetable slot assignment
 */
export const acceptAssignment = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;
  const { notification_id } = req.params;

  const notification = await models.TimetableNotification.findOne({
    where: { id: notification_id, faculty_id }
  });

  if (!notification) {
    throw new ErrorResponse('Notification not found', 404);
  }

  if (notification.status !== 'pending') {
    throw new ErrorResponse('This notification has already been responded to', 400);
  }

  // Get the slot assignment
  const assignment = await models.TimetableSlotAssignment.findOne({
    where: { id: notification.slot_assignment_id }
  });

  if (!assignment) {
    throw new ErrorResponse('Associated slot assignment not found', 404);
  }

  // Update both notification and assignment
  await Promise.all([
    notification.update({
      status: 'accepted',
      is_read: true,
      response_date: new Date()
    }),
    assignment.update({
      status: 'active'
    })
  ]);

  res.status(200).json({
    success: true,
    data: {
      notification,
      message: 'Assignment accepted successfully'
    }
  });
});

/**
 * Reject a timetable slot assignment
 */
export const rejectAssignment = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;
  const { notification_id } = req.params;
  const { rejection_reason } = req.body;

  const notification = await models.TimetableNotification.findOne({
    where: { id: notification_id, faculty_id }
  });

  if (!notification) {
    throw new ErrorResponse('Notification not found', 404);
  }

  if (notification.status !== 'pending') {
    throw new ErrorResponse('This notification has already been responded to', 400);
  }

  // Get the slot assignment
  const assignment = await models.TimetableSlotAssignment.findOne({
    where: { id: notification.slot_assignment_id }
  });

  if (!assignment) {
    throw new ErrorResponse('Associated slot assignment not found', 404);
  }

  // Update notification
  await notification.update({
    status: 'rejected',
    is_read: true,
    response_date: new Date(),
    rejection_reason: rejection_reason || null
  });

  // Mark assignment as inactive so incharge can reassign
  await assignment.update({
    status: 'inactive'
  });

  // Optionally create an alteration record noting the rejection
  await models.TimetableAlteration.create({
    department_id: assignment.Timetable ? assignment.Timetable.department_id : null,
    timetable_id: assignment.timetable_id,
    faculty_id,
    reason: `Faculty rejected assignment: ${rejection_reason || 'No reason provided'}`,
    status: 'rejected'
  }).catch(err => {
    // If alteration creation fails, continue anyway
    console.log('Warning: Could not create alteration record for rejection');
  });

  res.status(200).json({
    success: true,
    data: {
      notification,
      message: 'Assignment rejected successfully'
    }
  });
});

/**
 * Mark notification as read without responding
 */
export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;
  const { notification_id } = req.params;

  const notification = await models.TimetableNotification.findOne({
    where: { id: notification_id, faculty_id }
  });

  if (!notification) {
    throw new ErrorResponse('Notification not found', 404);
  }

  await notification.update({ is_read: true });

  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * Get unread notification count for faculty
 */
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;

  const count = await models.TimetableNotification.count({
    where: { faculty_id, is_read: false }
  });

  res.status(200).json({
    success: true,
    unreadCount: count
  });
});

/**
 * Bulk mark notifications as read
 */
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;

  await models.TimetableNotification.update(
    { is_read: true },
    { where: { faculty_id, is_read: false } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * Get notification summary (counts by status)
 */
export const getNotificationSummary = asyncHandler(async (req, res, next) => {
  const { faculty_id } = req.user;

  const [pending, accepted, rejected, unread] = await Promise.all([
    models.TimetableNotification.count({ where: { faculty_id, status: 'pending' } }),
    models.TimetableNotification.count({ where: { faculty_id, status: 'accepted' } }),
    models.TimetableNotification.count({ where: { faculty_id, status: 'rejected' } }),
    models.TimetableNotification.count({ where: { faculty_id, is_read: false } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      pending,
      accepted,
      rejected,
      unread,
      total: pending + accepted + rejected
    }
  });
});
