import { DataTypes } from 'sequelize';

const StudentAttendance = (sequelize) => {
  const StudentAttendanceModel = sequelize.define('StudentAttendance', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    master_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    attendance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    period_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    period_number: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    semester: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'od', 'medical_leave', 'duty_leave'),
      allowNull: false,
      defaultValue: 'absent',
    },
    is_lab_session: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    lab_group: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    session_type: {
      type: DataTypes.ENUM('theory', 'lab', 'tutorial', 'activity', 'project'),
      allowNull: false,
      defaultValue: 'theory',
    },
    marked_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_modified: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    modified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lesson_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'student_attendance',
    timestamps: false,
    indexes: [
      {
        name: 'uq_std_attendance',
        unique: true,
        fields: ['student_id', 'attendance_date', 'period_slot_id', 'subject_id'],
      },
    ],
  });

  StudentAttendanceModel.associate = (models) => {
    if (models.Student) {
      StudentAttendanceModel.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student',
      });
    }
    
    if (models.Class) {
      StudentAttendanceModel.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class',
      });
    }
    
    if (models.Subject) {
      StudentAttendanceModel.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subject',
      });
    }
    
    if (models.Faculty) {
      StudentAttendanceModel.belongsTo(models.Faculty, {
        foreignKey: 'faculty_id',
        as: 'faculty',
      });
    }
    
    if (models.PeriodSlot) {
      StudentAttendanceModel.belongsTo(models.PeriodSlot, {
        foreignKey: 'period_slot_id',
        as: 'period',
      });
    }
    
    if (models.TimetableMasterSlots) {
      StudentAttendanceModel.belongsTo(models.TimetableMasterSlots, {
        foreignKey: 'master_slot_id',
        as: 'masterSlot',
      });
    }
    
    if (models.CourseLessonPlan) {
      StudentAttendanceModel.belongsTo(models.CourseLessonPlan, {
        foreignKey: 'lesson_plan_id',
        as: 'lessonPlan',
      });
    }
  };

  return StudentAttendanceModel;
};

export default StudentAttendance;
