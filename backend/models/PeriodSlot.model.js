import { DataTypes } from 'sequelize';

const PeriodSlot = (sequelize) => {
  const PeriodSlotModel = sequelize.define('PeriodSlot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Period ID (1=I, 2=II, 4=III, 6=IV, 7=V, 9=VI, 10=VII; 3,5,8 are breaks)',
    },
    slot_order: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Order of the slot in the day',
    },
    slot_type: {
      type: DataTypes.ENUM('teaching', 'break'),
      defaultValue: 'teaching',
      comment: 'Type of slot'
    },
    period_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Period number (1-7)',
    },
    period_label: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'e.g. "I", "II", "III", "Tea Break", "Lunch"',
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Period start time',
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Period end time',
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration in minutes',
    },
    break_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Name if this is a break',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Is this slot active',
    },
  }, {
    tableName: 'period_slots',
    timestamps: false,
    freezeTableName: true,
  });

  PeriodSlotModel.associate = (models) => {
    // No associations needed - this is a read-only reference table
  };

  return PeriodSlotModel;
};

export default PeriodSlot;
