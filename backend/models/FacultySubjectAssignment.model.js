import { DataTypes } from 'sequelize';

const FacultySubjectAssignment = (sequelize) => {
  const FacultySubjectAssignmentModel = sequelize.define('FacultySubjectAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 8
      }
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Department admin who assigned',
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    total_hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total hours for the subject',
    },
    batch: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Batch year (e.g. 2025)',
    },
    no_of_periods: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of periods per week',
    },
  }, {
    tableName: 'faculty_subject_assignments',
    timestamps: false,
    indexes: [
      {
        // Ensure a subject can only have one assigned faculty per academic year + semester
        unique: true,
        fields: ['subject_id', 'academic_year', 'semester']
      },
      {
        fields: ['faculty_id', 'academic_year']
      },
      {
        fields: ['subject_id', 'academic_year']
      },
      {
        fields: ['status']
      }
    ]
  });

  FacultySubjectAssignmentModel.associate = (models) => {
    // Assignment belongs to Faculty
    FacultySubjectAssignmentModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });

    // Assignment belongs to Subject
    FacultySubjectAssignmentModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });

    // Assignment belongs to Class
    FacultySubjectAssignmentModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });

    // Assignment belongs to User (who assigned)
    FacultySubjectAssignmentModel.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assignedBy',
    });
  };

  return FacultySubjectAssignmentModel;
};

export default FacultySubjectAssignment;