import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TimetableSimple = sequelize.define('TimetableSimple', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  facultyId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'facultyId'
  },
  facultyName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'facultyName'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'department'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'year'
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'section'
  },
  day: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
    field: 'day'
  },
  hour: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'hour'
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'subject'
  },
  academicYear: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'academicYear'
  }
}, {
  tableName: 'timetable',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      unique: true,
      fields: ['facultyId', 'day', 'hour'],
      name: 'unique_faculty_day_hour'
    },
    {
      fields: ['facultyId'],
      name: 'idx_facultyId'
    },
    {
      fields: ['department'],
      name: 'idx_department'
    },
    {
      fields: ['academicYear'],
      name: 'idx_academicYear'
    },
    {
      fields: ['department', 'year', 'section'],
      name: 'idx_dept_year_section'
    }
  ]
});

export default TimetableSimple;
