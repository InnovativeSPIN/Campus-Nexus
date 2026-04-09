import { DataTypes } from 'sequelize';

const LeaveNotification = (sequelize) => {
  const LeaveNotificationModel = sequelize.define('LeaveNotification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    leave_request_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    recipient_type: {
      type: DataTypes.ENUM('faculty', 'department-admin', 'executiveadmin'),
      allowNull: false,
    },
    recipient_id: { type: DataTypes.INTEGER, allowNull: true },
    notification_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
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
