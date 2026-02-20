import { DataTypes } from 'sequelize';

const LeaveBalance = (sequelize) => {
  const LeaveBalanceModel = sequelize.define('LeaveBalance', {
    leave_balance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leave_type: {
      type: DataTypes.ENUM('Medical', 'Casual', 'Earned', 'On-Duty', 'Personal', 'Maternity', 'Comp-Off'),
      allowNull: false,
    },
    total_leaves: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
    },
    leaves_taken: {
      type: DataTypes.DECIMAL(4, 1),
      defaultValue: 0.0,
    },
    leaves_remaining: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING(9), // Format: YYYY-YYYY
      allowNull: false,
    },
  }, {
    tableName: 'staff_leave_balance',
    timestamps: false,
  });

  LeaveBalanceModel.associate = (models) => {
    // Define associations here if needed
    LeaveBalanceModel.belongsTo(models.User, {
      foreignKey: 'staff_id',
      as: 'staff',
    });
  };

  return LeaveBalanceModel;
};

export default LeaveBalance;