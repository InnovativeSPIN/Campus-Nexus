import { DataTypes } from 'sequelize';

const PeriodConfig = (sequelize) => {
  const PeriodConfigModel = sequelize.define('PeriodConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    periods: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    workingDays: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'period_configs',
    timestamps: true,
  });

  PeriodConfigModel.associate = (models) => {
    // Define associations here if needed
  };

  return PeriodConfigModel;
};

export default PeriodConfig;