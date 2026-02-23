import { DataTypes } from 'sequelize';

const YearBreakTiming = (sequelize) => {
  const YearBreakTimingModel = sequelize.define('YearBreakTiming', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.ENUM('1st', '2nd', '3rd', '4th'),
      allowNull: false,
    },
    break_name: {
      type: DataTypes.STRING(100),
      allowNull: false, // e.g., "Morning Break", "Lunch Break"
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false, // HH:MM:SS format
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false, // HH:MM:SS format
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'year_break_timings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  YearBreakTimingModel.associate = (models) => {
    YearBreakTimingModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
  };

  return YearBreakTimingModel;
};

export default YearBreakTiming;
