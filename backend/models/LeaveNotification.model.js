import { DataTypes } from 'sequelize';

const LeaveNotification = (sequelize) => {
  const LeaveNotificationModel = sequelize.define('LeaveNotification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    leaveId: { type: DataTypes.INTEGER, field: 'leave_request_id', allowNull: true, defaultValue: 0 },
    recipientType: {
      type: DataTypes.ENUM('faculty', 'department-admin', 'executiveadmin'),
      field: 'recipient_type',
      allowNull: false,
    },
    recipientId: { type: DataTypes.INTEGER, field: 'recipient_id', allowNull: true },
    type: {
      type: DataTypes.STRING(50),
      field: 'notification_type',
      allowNull: false,
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, field: 'is_read', defaultValue: false },
    createdAt: { type: DataTypes.DATE, field: 'sent_at', defaultValue: DataTypes.NOW },
  }, {
    tableName: 'leave_notifications_v2',
    timestamps: false,
  });

  LeaveNotificationModel.associate = (models) => {
    // Associations can be added here if needed
  };

  return LeaveNotificationModel;
};

export default LeaveNotification;
