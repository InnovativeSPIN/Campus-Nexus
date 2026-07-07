import { DataTypes } from 'sequelize';

const CourseLessonPlanNotification = (sequelize) => {
  const CourseLessonPlanNotificationModel = sequelize.define(
    'CourseLessonPlanNotification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      course_lesson_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> course_lesson_plans.id',
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> faculty_profiles.faculty_id',
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
          'approval_request',
          'approved',
          'rejected',
          'revision_requested'
        ),
        allowNull: false,
        comment: 'Type of notification event',
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'course_lesson_plan_notifications',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['recipient_id', 'is_read'],
          name: 'idx_clpn_recipient_read',
        },
        {
          fields: ['course_lesson_plan_id'],
          name: 'idx_clpn_plan_id',
        },
      ],
    }
  );

  CourseLessonPlanNotificationModel.associate = (models) => {
    if (models.CourseLessonPlan) {
      CourseLessonPlanNotificationModel.belongsTo(models.CourseLessonPlan, {
        foreignKey: 'course_lesson_plan_id',
        as: 'courseLessonPlan',
      });
    }

    if (models.Faculty) {
      CourseLessonPlanNotificationModel.belongsTo(models.Faculty, {
        foreignKey: 'faculty_id',
        as: 'sender',
        targetKey: 'faculty_id',
      });
      CourseLessonPlanNotificationModel.belongsTo(models.Faculty, {
        foreignKey: 'recipient_id',
        as: 'recipient',
        targetKey: 'faculty_id',
      });
    }
  };

  return CourseLessonPlanNotificationModel;
};

export default CourseLessonPlanNotification;
