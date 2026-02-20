import { DataTypes } from 'sequelize';

const TimetableSlot = (sequelize) => {
  const TimetableSlotModel = sequelize.define('TimetableSlot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    timetable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    day: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
      allowNull: false,
    },
    period_number: {
      type: DataTypes.INTEGER,
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
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    room: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('lecture', 'lab', 'tutorial'),
      defaultValue: 'lecture',
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'timetable_slots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  TimetableSlotModel.associate = (models) => {
    TimetableSlotModel.belongsTo(models.Timetable, {
      foreignKey: 'timetable_id',
      as: 'timetable',
    });
    TimetableSlotModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });
    TimetableSlotModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });
    TimetableSlotModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });
  };

  return TimetableSlotModel;
};

export default TimetableSlot;