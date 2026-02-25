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
      unique: true,
      field: 'subject_code'
    },
    department_id: {
      type: DataTypes.INTEGER,
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
    sem_type: {
      type: DataTypes.ENUM('odd', 'even'),
      allowNull: true,
      defaultValue: 'odd',
      comment: 'Odd or Even semester type',
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
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Specific class if subject is class-specific, NULL for department-wide',
    },
    min_hours_per_week: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
    },
    max_students: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum students allowed, NULL for no limit',
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