import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const Student = (sequelize) => {
  const StudentModel = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    rollNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    admissionNo: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING(255),
      defaultValue: 'default-student.png',
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    batch: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    admissionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // link to user account (added later via migration)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admissionType: {
      type: DataTypes.ENUM('regular', 'lateral', 'management'),
      defaultValue: 'regular',
    },
    feeStatus: {
      type: DataTypes.ENUM('paid', 'pending', 'partial'),
      defaultValue: 'pending',
    },
    status: {
      // active, inactive, graduated, dropped, suspended
      type: DataTypes.ENUM('active', 'inactive', 'graduated', 'dropped', 'suspended'),
      defaultValue: 'active',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'student_profile',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeCreate: async (student) => {
        if (student.password) {
          const salt = await bcrypt.genSalt(10);
          student.password = await bcrypt.hash(student.password, salt);
        }
      },
      beforeUpdate: async (student) => {
        if (student.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          student.password = await bcrypt.hash(student.password, salt);
        }
      },
    },
  });

  StudentModel.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  StudentModel.prototype.getSignedJwtToken = function () {
    return jwt.sign({ id: this.id, type: 'student' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  };

  StudentModel.associate = (models) => {
    // Define associations here if needed
    StudentModel.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });
    StudentModel.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class',
    });
    // allow joining back to the user account
    StudentModel.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    // One-to-one relationship with extended bio profile
    StudentModel.hasOne(models.StudentBio, {
      foreignKey: 'studentId',
      as: 'bio',
    });
  };

  StudentModel.generateStudentId = async function (batch, departmentCode) {
    // Basic format: YearPrefix + DeptCode + 3-digit random/increment
    // e.g. 21CSE001
    const year = batch ? batch.split('-')[0].substring(2) : '21';
    const dept = departmentCode ? departmentCode.substring(0, 3).toUpperCase() : 'GEN';
    const random = Math.floor(Math.random() * 900) + 100; // 100-999
    return `${year}${dept}${random}`;
  };

  return StudentModel;
};

export default Student;