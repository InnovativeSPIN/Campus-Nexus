import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const Faculty = (sequelize) => {
  const FacultyModel = sequelize.define('Faculty', {
    faculty_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    faculty_college_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    coe_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    AICTE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Anna_University_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    educational_qualification: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_of_joining: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profile_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'on_leave', 'retired'),
      defaultValue: 'active',
    },
    blood_group: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    aadhar_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    pan_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    perm_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    curr_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'faculty_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (faculty) => {
        if (faculty.password) {
          const salt = await bcrypt.genSalt(10);
          faculty.password = await bcrypt.hash(faculty.password, salt);
        }
      },
      beforeUpdate: async (faculty) => {
        if (faculty.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          faculty.password = await bcrypt.hash(faculty.password, salt);
        }
      },
    },
  });

  FacultyModel.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  FacultyModel.prototype.getSignedJwtToken = function () {
    return jwt.sign({ id: this.faculty_id, type: 'faculty' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  };

  FacultyModel.associate = (models) => {
    // Define associations here if needed
    FacultyModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
  };

  return FacultyModel;
};

export default Faculty;