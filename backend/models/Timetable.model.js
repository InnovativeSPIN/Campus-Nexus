import { DataTypes } from 'sequelize';

const Timetable = (sequelize) => {
  const TimetableModel = sequelize.define('Timetable', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    semester: {
      type: DataTypes.ENUM('odd', 'even'),
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      defaultValue: 'draft',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'timetables',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  TimetableModel.associate = (models) => {
    TimetableModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
    TimetableModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });
    TimetableModel.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    TimetableModel.hasMany(models.TimetableSlot, {
      foreignKey: 'timetable_id',
      as: 'slots',
    });
  };

  return TimetableModel;
};

export default Timetable;