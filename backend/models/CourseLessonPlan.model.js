import { DataTypes } from 'sequelize';

const CourseLessonPlan = (sequelize) => {
  const CourseLessonPlanModel = sequelize.define(
    'CourseLessonPlan',
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
      sno: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: 'Sequential number within subject/class (1-based)',
      },
      unit_number: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: 'Unit number (1, 2, 3, etc.)',
      },
      unit_label: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Unit label from PDF (e.g., "UNIT I", "UNIT II")',
      },
      topic: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Full topic name from Course File Section X',
      },
      co_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Course Outcome (e.g., CO1, CO2, C502.1)',
      },
      btl: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Bloom TAX Level (BT1, BT2, BT3, etc. - comma-separated)',
      },
      delivery_mode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Content delivery method (PPT, E-Resources, BB, Case Study, etc.)',
      },
      reference_book: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Reference book citation (e.g., T1-416, T2-03)',
      },
      periods_required: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: 'Number of class periods needed for this topic',
      },
      periods_taken: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of periods already taught (incremented by period_topic_log)',
      },
      cumulative_periods: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Running total: SUM(periods_required) from start to this topic',
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '1 if periods_taken >= periods_required',
      },
      tentative_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Planned/target date to cover this topic',
      },
      approval_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'revision_requested'),
        defaultValue: 'pending',
        comment: 'Approval status by department admin (pending, approved, rejected, revision_requested)',
      },
      approval_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Remarks from department admin on approval/rejection',
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Department admin faculty_id who approved this plan',
      },
      approved_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the department admin approved this plan',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this lesson plan entry',
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last modified this entry',
      },
      upload_batch_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Unique ID for batch upload (groups related topics)',
      },
      batch_submission_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When this batch was submitted for approval',
      },
      coverage_status: {
        type: DataTypes.ENUM('completed', 'deviation'),
        allowNull: true,
        comment: 'Status of topic coverage (completed or deviation)',
      },
      coverage_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when the topic coverage was recorded',
      },
      completed_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when the topic was marked as completed',
      },
      deviation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for deviation if status is deviation',
      },
      additional_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes about the topic coverage',
      },
    },
    {
      tableName: 'course_lesson_plans',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['faculty_id', 'subject_id', 'class_id', 'academic_year', 'semester', 'sno'],
          name: 'uq_course_plan',
        },
        {
          fields: ['faculty_id', 'subject_id'],
          name: 'idx_faculty_subject',
        },
        {
          fields: ['class_id', 'academic_year', 'semester'],
          name: 'idx_class_academic',
        },
        {
          fields: ['is_completed'],
          name: 'idx_completed',
        },
        {
          fields: ['faculty_id', 'is_completed'],
          name: 'idx_pending',
        },
        {
          fields: ['upload_batch_id'],
          name: 'idx_batch_id',
        },
        {
          fields: ['batch_submission_date'],
          name: 'idx_batch_submission',
        },
      ],
    }
  );

  CourseLessonPlanModel.associate = (models) => {
    // Belongs to Faculty
    if (models.Faculty) {
      CourseLessonPlanModel.belongsTo(models.Faculty, {
        foreignKey: 'faculty_id',
        as: 'faculty',
        targetKey: 'faculty_id',
      });
    }

    // Belongs to Subject
    if (models.Subject) {
      CourseLessonPlanModel.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subject',
      });
    }

    // Belongs to Class
    if (models.Class) {
      CourseLessonPlanModel.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
      });
    }

    // Has many PeriodTopicLogs
    if (models.PeriodTopicLog) {
      CourseLessonPlanModel.hasMany(models.PeriodTopicLog, {
        foreignKey: 'lesson_plan_id',
        as: 'periodLogs',
      });
    }
  };

  return CourseLessonPlanModel;
};

export default CourseLessonPlan;
