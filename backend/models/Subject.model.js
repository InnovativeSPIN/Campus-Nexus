import { DataTypes } from 'sequelize';

const Subject = (sequelize) => {
  const SubjectModel = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'subject_name'
    },
    subject_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'subject_code'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Department ID (null if available_to_all_departments is true)',
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 8
      }
    },
    sem_type: {
      type: DataTypes.ENUM('odd', 'even'),
      allowNull: true,
      defaultValue: 'odd',
      comment: 'Odd or Even semester type',
    },
    batch: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Batch year e.g. 2025, 2026',
    },
    academic_year: {
      type: DataTypes.STRING(9),
      allowNull: true,
      comment: 'Academic year e.g. 2025-2026',
    },
    year: {
      type: DataTypes.TINYINT,
      allowNull: true,
      validate: { min: 1, max: 4 },
      comment: 'Academic year 1-4 (derived from semester)',
    },
    lab_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Lab name - only for laboratory subjects',
    },
    credits: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      defaultValue: 4.00,
    },
    type: {
      type: DataTypes.ENUM('Theory', 'Practical', 'Theory+Practical', 'Project', 'Seminar', 'Internship'),
      defaultValue: 'Theory',
    },
    is_elective: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_laboratory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subject_category: {
      type: DataTypes.ENUM('academic', 'library', 'sports', 'placement'),
      defaultValue: 'academic',
      comment: 'Category of subject (academic/library/sports/placement)',
    },
    available_to_all_departments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'If true, subject is available to all departments regardless of department_id',
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Specific class if subject is class-specific, NULL for department-wide',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Admin who created the subject',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'subjects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  SubjectModel.associate = (models) => {
    // Subject belongs to Department
    SubjectModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });

    // Subject belongs to Class (optional)
    SubjectModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });

    // Subject belongs to User who created it
    SubjectModel.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });

    // Subject can be assigned to many faculty through faculty_subject_assignments
    SubjectModel.belongsToMany(models.Faculty, {
      through: models.FacultySubjectAssignment,
      foreignKey: 'subject_id',
      otherKey: 'faculty_id',
      as: 'assignedFaculty',
    });

    // Subject has many class mappings
    SubjectModel.hasMany(models.SubjectClassMapping, {
      foreignKey: 'subject_id',
      as: 'classMappings',
    });
  };

  return SubjectModel;
};

export default Subject;