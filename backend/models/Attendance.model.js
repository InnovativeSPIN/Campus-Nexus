import { DataTypes } from 'sequelize';

const Attendance = (sequelize) => {
  const AttendanceModel = sequelize.define('Attendance', {
    staff_attendance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    class_section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    work_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_session_number: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    attendance_status: {
      type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Half-Day', 'On-Leave', 'On-Duty'),
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    check_out_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    marked_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'staff_attendance_entry',
    timestamps: false, // Uses marked_timestamp instead
  });

  AttendanceModel.associate = (models) => {
    // Define associations here if needed
    AttendanceModel.belongsTo(models.User, {
      foreignKey: 'staff_id',
      as: 'staff',
    });
    AttendanceModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
    AttendanceModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });
    AttendanceModel.belongsTo(models.Class, {
      foreignKey: 'class_section_id',
      as: 'classSection',
    });
  };

  return AttendanceModel;
};

export default Attendance;