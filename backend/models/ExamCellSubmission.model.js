import { DataTypes } from 'sequelize';

const ExamCellSubmission = (sequelize) => {
  const ExamCellSubmissionModel = sequelize.define('ExamCellSubmission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facultyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'faculty_id'
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subject_id'
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'class_id'
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    academicYear: {
      type: DataTypes.STRING(9),
      allowNull: false,
      field: 'academic_year'
    },
    batch: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    internalNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'internal_number'
    },
    status: {
      type: DataTypes.ENUM('submitted', 'under_review', 'published', 'rejected'),
      defaultValue: 'submitted',
      allowNull: false
    },
    totalStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_students'
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at'
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reviewed_by'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at'
    },
    publishedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'published_by'
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'exam_cell_submissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ExamCellSubmissionModel.associate = (models) => {
    ExamCellSubmissionModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
      targetKey: 'faculty_id'
    });
    ExamCellSubmissionModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject'
    });
    ExamCellSubmissionModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class'
    });
    ExamCellSubmissionModel.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer'
    });
  };

  return ExamCellSubmissionModel;
};

export default ExamCellSubmission;
