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
      type: DataTypes.ENUM('pending', 'hod_approved', 'approved', 'rejected', 'cancelled'),
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
    // Substitution workflow fields
    affected_periods: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of timetable period IDs affected by this leave',
    },
    substitute_faculty_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Faculty college code of the substitute',
    },
    substitute_status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: true,
    },
    substitute_notified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    substitute_response_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    substitute_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admin_approval_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: true,
    },
    admin_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timetable_altered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reassign_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Faculty ID who will cover during this leave',
    },
    documentUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL of the uploaded supporting document',
    },
    loadAssign: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Workload distribution details',
    },

  }, {
    tableName: 'leaves',
    timestamps: true,
  });

  LeaveModel.associate = (models) => {
    // Note: applicantId contains Faculty.faculty_id or Student.id, not User.id
    // So we don't directly associate with User here
    LeaveModel.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });
    LeaveModel.belongsTo(models.Faculty, {
      foreignKey: 'applicantId',
      as: 'applicant',
    });
    LeaveModel.belongsTo(models.Faculty, {
      foreignKey: 'reassign_faculty_id',
      as: 'reassignFaculty',
    });

  };

  return LeaveModel;
};

export default Leave;