import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Faculty = sequelize.define('Faculty', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternatePhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  designation: {
    type: DataTypes.ENUM('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Assistant', 'HOD'),
    allowNull: false
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  joiningDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  salary: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on-leave', 'resigned'),
    defaultValue: 'active'
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.JSON,
    allowNull: true
  },
  bankDetails: {
    type: DataTypes.JSON,
    allowNull: true
  },
  orcidId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phdStatus: {
    type: DataTypes.ENUM('Completed', 'Pursuing'),
    allowNull: true
  },
  thesisTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  registerNo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guideName: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'faculty',
  timestamps: true
});

Faculty.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

export default Faculty;
