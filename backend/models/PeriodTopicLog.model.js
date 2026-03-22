import { DataTypes } from 'sequelize';

const PeriodTopicLog = (sequelize) => {
  const PeriodTopicLogModel = sequelize.define(
    'PeriodTopicLog',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      attendance_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date of the class held',
      },
      period_slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> period_slots.id (period number I, II, III, etc.)',
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> faculty_profiles.faculty_id (teaching faculty)',
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> classes.id (class where taught)',
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> subjects.id (subject taught)',
      },
      lesson_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK -> course_lesson_plans.id (the lesson plan topic taught)',
      },
      co_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Course Outcome covered (denormalized from course_lesson_plans)',
      },
      btl: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Bloom TAX Level covered (denormalized from course_lesson_plans)',
      },
      is_deviation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '1 if faculty taught a different topic than planned for this period',
      },
      deviation_note: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for teaching different topic (if is_deviation=1)',
      },
      master_slot_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK -> timetable_master_slots.id (direct reference to timetable slot for performance)',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this log entry',
      },
    },
    {
      tableName: 'period_topic_log',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['attendance_date', 'period_slot_id', 'faculty_id', 'class_id', 'subject_id'],
          name: 'uq_period_log',
          comment: 'Prevent duplicate logging for same period',
        },
        {
          fields: ['lesson_plan_id'],
          name: 'idx_lesson_plan',
        },
        {
          fields: ['faculty_id', 'attendance_date'],
          name: 'idx_faculty_date',
        },
        {
          fields: ['subject_id', 'attendance_date'],
          name: 'idx_subject_date',
        },
        {
          fields: ['class_id', 'attendance_date'],
          name: 'idx_class_date',
        },
        {
          fields: ['attendance_date', 'faculty_id', 'subject_id'],
          name: 'idx_date_faculty_subject',
          comment: 'For progress report queries by date range',
        },
      ],
    }
  );

  PeriodTopicLogModel.associate = (models) => {
    // Belongs to CourseLessonPlan
    if (models.CourseLessonPlan) {
      PeriodTopicLogModel.belongsTo(models.CourseLessonPlan, {
        foreignKey: 'lesson_plan_id',
        as: 'lessonPlan',
      });
    }

    // Belongs to Faculty
    if (models.Faculty) {
      PeriodTopicLogModel.belongsTo(models.Faculty, {
        foreignKey: 'faculty_id',
        as: 'faculty',
        targetKey: 'faculty_id',
      });
    }

    // Belongs to Subject
    if (models.Subject) {
      PeriodTopicLogModel.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subject',
      });
    }

    // Belongs to Class
    if (models.Class) {
      PeriodTopicLogModel.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
      });
    }

    // Belongs to TimetableMasterSlots (for reference)
    if (models.TimetableMasterSlots) {
      PeriodTopicLogModel.belongsTo(models.TimetableMasterSlots, {
        foreignKey: 'master_slot_id',
        as: 'masterSlot',
      });
    }
  };

  return PeriodTopicLogModel;
};

export default PeriodTopicLog;
