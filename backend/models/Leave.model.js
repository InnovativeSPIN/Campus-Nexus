import { DataTypes } from 'sequelize';

const Leave = (sequelize) => {
  const LeaveModel = sequelize.define('Leave', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    leaveType: {
      type: DataTypes.ENUM('Medical', 'Casual', 'Earned', 'On-Duty', 'Personal', 'Maternity', 'Comp-Off'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalDays: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending',
    },
    approvedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvalRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applicantType: {
      type: DataTypes.ENUM('faculty', 'student'),
      allowNull: false,
      defaultValue: 'faculty',
    },
  }, {
    tableName: 'leaves',
    timestamps: true,
  });

  LeaveModel.associate = (models) => {
    LeaveModel.belongsTo(models.User, {
      foreignKey: 'applicantId',
      as: 'applicant',
    });
    LeaveModel.belongsTo(models.User, {
      foreignKey: 'approvedById',
      as: 'approvedBy',
    });
    LeaveModel.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });
  };

  return LeaveModel;
};

export default Leave;