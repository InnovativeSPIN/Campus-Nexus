import { DataTypes } from 'sequelize';

const FacultySubstitutes = (sequelize) => {
  const FacultySubstitutesModel = sequelize.define('FacultySubstitutes', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Absent faculty - FK -> faculty_profiles.faculty_id',
    },
    substitute_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Requested substitute - FK -> faculty_profiles.faculty_id',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Leave start date',
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Leave end date',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Leave reason',
    },
    leave_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK -> leave_requests.id',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      comment: 'pending = waiting for substitute to accept; approved = substitute accepted; rejected = substitute rejected',
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Self-approval by substitute_faculty_id on acceptance',
    },
    approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of approval/rejection',
    },
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Same as faculty_id (the one requesting)',
    },
  }, {
    tableName: 'faculty_substitutes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  FacultySubstitutesModel.associate = (models) => {
    FacultySubstitutesModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'absent_faculty',
    });
    FacultySubstitutesModel.belongsTo(models.Faculty, {
      foreignKey: 'substitute_faculty_id',
      as: 'substitute_faculty',
    });
    FacultySubstitutesModel.belongsTo(models.Faculty, {
      foreignKey: 'requested_by',
      as: 'requester',
    });
    FacultySubstitutesModel.belongsTo(models.Leave, {
      foreignKey: 'leave_id',
      as: 'leave_request',
    });
  };

  return FacultySubstitutesModel;
};

export default FacultySubstitutes;
