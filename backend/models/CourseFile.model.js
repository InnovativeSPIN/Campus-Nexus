import { DataTypes } from 'sequelize';

const CourseFile = (sequelize) => {
  const CourseFileModel = sequelize.define(
    'CourseFile',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> faculty_profiles.faculty_id',
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> subjects.id',
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> classes.id',
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> departments.id (for quick admin filtering)',
      },
      academic_year: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'e.g., 2025-2026',
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Semester number (1-8)',
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Original uploaded filename',
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Server path to uploaded PDF file',
      },
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'File size in bytes',
      },
      file_hash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'SHA256 hash for duplicate detection',
      },
      status: {
        type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'revision_requested'),
        defaultValue: 'draft',
        comment: 'Workflow status of the course file',
      },
      submission_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When faculty submitted for approval',
      },
      approval_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Remarks from department admin on approval/rejection',
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK -> faculty_profiles.faculty_id (department admin who approved)',
      },
      approved_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When department admin approved',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '1 = currently displayed to students, 0 = archived or draft',
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Version number for tracking updates',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Internal notes (faculty can add details about the file)',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who created/uploaded this file',
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last modified',
      },
    },
    {
      tableName: 'course_files',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['faculty_id', 'subject_id', 'class_id', 'academic_year', 'semester'],
          name: 'idx_course_file_assignment',
        },
        {
          fields: ['department_id', 'status'],
          name: 'idx_dept_status',
        },
        {
          fields: ['status'],
          name: 'idx_status',
        },
        {
          fields: ['submission_date'],
          name: 'idx_submission_date',
        },
      ],
    }
  );

  CourseFileModel.associate = (models) => {
    // Belongs to Faculty (uploader)
    if (models.Faculty) {
      CourseFileModel.belongsTo(models.Faculty, {
        foreignKey: 'faculty_id',
        as: 'faculty',
        targetKey: 'faculty_id',
      });
    }

    // Belongs to Faculty (approver) - department admin
    if (models.Faculty) {
      CourseFileModel.belongsTo(models.Faculty, {
        foreignKey: 'approved_by',
        as: 'approver',
        targetKey: 'faculty_id',
      });
    }

    // Belongs to Subject
    if (models.Subject) {
      CourseFileModel.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subject',
      });
    }

    // Belongs to Class
    if (models.Class) {
      CourseFileModel.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
      });
    }

    // Belongs to Department
    if (models.Department) {
      CourseFileModel.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department',
      });
    }

    // Has many notifications
    if (models.CourseFileNotification) {
      CourseFileModel.hasMany(models.CourseFileNotification, {
        foreignKey: 'course_file_id',
        as: 'notifications',
      });
    }
  };

  return CourseFileModel;
};

export default CourseFile;
