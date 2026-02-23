import { DataTypes } from 'sequelize';

const TimetableSlotAssignment = (sequelize) => {
  const TimetableSlotAssignmentModel = sequelize.define('TimetableSlotAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    timetable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    subject_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    day_of_week: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
      allowNull: false,
    },
    year: {
      type: DataTypes.ENUM('1st', '2nd', '3rd', '4th'),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    room_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending_approval'),
      defaultValue: 'pending_approval',
    },
  }, {
    tableName: 'timetable_slot_assignments',
    timestamps: true,
  });

  TimetableSlotAssignmentModel.associate = (models) => {
    if (models.Timetable) {
      TimetableSlotAssignmentModel.belongsTo(models.Timetable, {
        foreignKey: 'timetable_id',
        as: 'timetable',
      });
    }
    if (models.Class) {
      TimetableSlotAssignmentModel.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
      });
    }
    if (models.Faculty) {
      TimetableSlotAssignmentModel.belongsTo(models.Faculty, {
        foreignKey: 'faculty_id',
        as: 'faculty',
      });
      TimetableSlotAssignmentModel.belongsTo(models.Faculty, {
        foreignKey: 'assigned_by',
        as: 'assignedByFaculty',
      });
    }
  };

  return TimetableSlotAssignmentModel;
};

export default TimetableSlotAssignment;
