import { DataTypes } from 'sequelize';

const ExamCellNotification = (sequelize) => {
  const ExamCellNotificationModel = sequelize.define('ExamCellNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    submissionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'submission_id'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('result_published', 'marks_submitted', 'marks_rejected', 'reminder'),
      allowNull: false
    },
    targetRole: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'target_role'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'department_id'
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'class_id'
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    academicYear: {
      type: DataTypes.STRING(9),
      allowNull: true,
      field: 'academic_year'
    },
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_sent'
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at'
    }
  }, {
    tableName: 'exam_cell_notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ExamCellNotificationModel.associate = (models) => {
    ExamCellNotificationModel.belongsTo(models.ExamCellSubmission, {
      foreignKey: 'submission_id',
      as: 'submission'
    });
    ExamCellNotificationModel.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  };

  return ExamCellNotificationModel;
};

export default ExamCellNotification;
