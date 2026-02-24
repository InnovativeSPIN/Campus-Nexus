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
    phd_status: {
      type: DataTypes.ENUM('Yes', 'No', 'Pursuing'),
      defaultValue: 'No',
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
    linkedin_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_timetable_incharge: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_placement_coordinator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    const tokenType = this.role_id === 7 ? 'department-admin' : 'faculty';
    return jwt.sign({ id: this.faculty_id, type: tokenType }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  };

  FacultyModel.associate = (models) => {
    // Faculty belongs to Department
    FacultyModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });

    // Faculty can be assigned to many subjects through faculty_subject_assignments
    FacultyModel.belongsToMany(models.Subject, {
      through: 'faculty_subject_assignments',
      foreignKey: 'faculty_id',
      otherKey: 'subject_id',
      as: 'subjects',
    });

    // Faculty has many subject assignments
    FacultyModel.hasMany(models.FacultySubjectAssignment, {
      foreignKey: 'faculty_id',
      as: 'subjectAssignments',
    });

    // Faculty can be assigned to many classes through the faculty_subject_assignments table (class_id exists in that table)
    FacultyModel.belongsToMany(models.Class, {
      through: models.FacultySubjectAssignment || 'faculty_subject_assignments',
      foreignKey: 'faculty_id',
      otherKey: 'class_id',
      as: 'assignedClasses',
    });

    // Faculty has many education qualifications
    FacultyModel.hasMany(models.FacultyEduQualification, {
      foreignKey: 'faculty_id',
      as: 'eduQualifications',
    });

    // Faculty has many experiences
    FacultyModel.hasMany(models.FacultyExperience, {
      foreignKey: 'faculty_id',
      as: 'experiences',
    });

    // Faculty has many industry experiences (separate table)
    FacultyModel.hasMany(models.FacultyIndustryExperience, {
      foreignKey: 'faculty_id',
      as: 'industryExperiences',
    });
  };

  return FacultyModel;
};

export default Faculty;