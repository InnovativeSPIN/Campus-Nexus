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
    // Multi-level approval workflow
    overall_status: {
      type: DataTypes.ENUM(
        'pending', 
        'substitute_pending', 
        'substitute_approved', 
        'substitute_rejected',
        'hod_approved',
        'timetable_pending',
        'timetable_approved',
        'executive_pending',
        'executive_approved',
        'approved',
        'rejected',
        'cancelled'
      ),
      defaultValue: 'pending',
      comment: 'Overall status of leave request through the complete workflow',
    },
    // Substitute Faculty Approval (STEP 2)
    substitute_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Requested substitute faculty ID',
    },
    substitute_approval_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: true,
      defaultValue: 'pending',
      comment: 'Substitute faculty approval decision',
    },
    substitute_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when substitute approved or rejected',
    },
    substitute_rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason provided by substitute if rejected',
    },
    // Timetable Incharge Approval (STEP 3)
    timetable_incharge_approval_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: true,
      defaultValue: 'pending',
      comment: 'Timetable incharge approval decision',
    },
    timetable_incharge_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Timetable incharge faculty ID',
    },
    timetable_incharge_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when timetable incharge approved or rejected',
    },
    timetable_incharge_rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason provided by timetable incharge if rejected',
    },
    // Executive Admin Approval for >2 day leaves (STEP 4)
    executive_admin_approval_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: true,
      defaultValue: null,
      comment: 'Executive admin approval (only for leaves > 2 days)',
    },
    executive_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Executive admin faculty ID who approved/rejected',
    },
    executive_admin_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when executive admin approved or rejected',
    },
    executive_admin_rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason provided by executive admin if rejected',
    },
    // Department Admin Notification
    dept_admin_notified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether department admin has been notified of alteration',
    },
    dept_admin_notified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when department admin was notified',
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
    LeaveModel.belongsTo(models.Faculty, {
      foreignKey: 'substitute_faculty_id',
      as: 'substituteFaculty',
    });
    LeaveModel.belongsTo(models.Faculty, {
      foreignKey: 'timetable_incharge_id',
      as: 'timetableIncharge',
    });
    LeaveModel.belongsTo(models.Faculty, {
      foreignKey: 'executive_admin_id',
      as: 'executiveAdmin',
    });
    LeaveModel.hasMany(models.FacultySubstitutes, {
      foreignKey: 'leave_id',
      as: 'substitutes',
    });
    LeaveModel.hasMany(models.FacultyLeaveSchedule, {
      foreignKey: 'leave_id',
      as: 'schedule',
    });
  };

  return LeaveModel;
};

export default Leave;