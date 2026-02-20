import { DataTypes } from 'sequelize';

const AttendanceStudent = (sequelize) => {
  const AttendanceStudentModel = sequelize.define('AttendanceStudent', {
    attendance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_session_number: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    attendance_status: {
      type: DataTypes.ENUM('Present', 'Absent', 'Late', 'On-Duty'),
      allowNull: false,
    },
    marked_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'student_attendance_entry',
    timestamps: false, // Uses marked_timestamp instead
  });

  AttendanceStudentModel.associate = (models) => {
    // Define associations here if needed
    AttendanceStudentModel.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student',
    });
    AttendanceStudentModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });
    AttendanceStudentModel.belongsTo(models.Class, {
      foreignKey: 'class_section_id',
      as: 'classSection',
    });
    AttendanceStudentModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });
  };

  return AttendanceStudentModel;
};

export default AttendanceStudent;