import { DataTypes } from 'sequelize';

const CourseFileNotification = (sequelize) => {
  const CourseFileNotificationModel = sequelize.define(
    'CourseFileNotification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      course_file_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> course_files.id',
      },
      recipient_type: {
        type: DataTypes.ENUM('faculty', 'department-admin'),
        allowNull: false,
        comment: 'Who should receive this notification',
      },
      recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK -> faculty_profiles.faculty_id',
      },
      notification_type: {
        type: DataTypes.ENUM(
          'submission_received',
          'approval_request',
          'approved',
          'rejected',
          'revision_requested'
        ),
        allowNull: false,
        comment: 'Type of notification event',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Notification title',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notification message body',
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '1 = recipient has read this notification',
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the recipient read the notification',
      },
      action_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Link to relevant page (e.g., /approvals/123)',
      },
    },
    {
      tableName: 'course_file_notifications',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['recipient_id', 'is_read'],
          name: 'idx_recipient_read',
        },
        {
          fields: ['course_file_id'],
          name: 'idx_course_file_id',
        },
        {
          fields: ['created_at'],
          name: 'idx_created_at',
        },
      ],
    }
  );

  CourseFileNotificationModel.associate = (models) => {
    if (models.CourseFile) {
      CourseFileNotificationModel.belongsTo(models.CourseFile, {
        foreignKey: 'course_file_id',
        as: 'courseFile',
      });
    }

    if (models.Faculty) {
      CourseFileNotificationModel.belongsTo(models.Faculty, {
        foreignKey: 'recipient_id',
        as: 'recipient',
        targetKey: 'faculty_id',
      });
    }
  };

  return CourseFileNotificationModel;
};

export default CourseFileNotification;
