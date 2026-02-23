import { DataTypes } from 'sequelize';

const TimetableNotification = (sequelize) => {
  const TimetableNotificationModel = sequelize.define('TimetableNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    slot_assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false, // timetable incharge
    },
    subject_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    subject_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending',
    },
    response_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'timetable_notifications',
    timestamps: true,
  });

  TimetableNotificationModel.associate = (models) => {
    TimetableNotificationModel.belongsTo(models.TimetableSlotAssignment, {
      foreignKey: 'slot_assignment_id',
      as: 'slotAssignment',
    });
    TimetableNotificationModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });
    TimetableNotificationModel.belongsTo(models.Faculty, {
      foreignKey: 'requested_by',
      as: 'requestedByFaculty',
    });
    TimetableNotificationModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });
    TimetableNotificationModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });
  };

  return TimetableNotificationModel;
};

export default TimetableNotification;
