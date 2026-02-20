import { DataTypes } from 'sequelize';

const Leave = (sequelize) => {
  const LeaveModel = sequelize.define('Leave', {
    staff_leave_id: {
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
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_leave_days: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
    },
    leave_reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    applied_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    leave_status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
      defaultValue: 'Pending',
    },
  }, {
    tableName: 'staff_leave_request',
    timestamps: false, // Uses applied_timestamp instead
  });

  LeaveModel.associate = (models) => {
    // Define associations here if needed
    LeaveModel.belongsTo(models.User, {
      foreignKey: 'staff_id',
      as: 'staff',
    });
  };

  return LeaveModel;
};

export default Leave;