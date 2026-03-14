import { DataTypes } from 'sequelize';

const ClassModel = (sequelize) => {
  const Class = sequelize.define('Classes', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    batch: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    academic_year: {
      type: DataTypes.STRING(9),
      allowNull: true,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  }, {
    tableName: 'classes',
    timestamps: false,
  });

  Class.associate = (models) => {
    // Define associations here if needed
    Class.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
    Class.hasMany(models.Student, {
      foreignKey: 'classId',
      as: 'students',
    });
    // Class can be assigned to many faculty through faculty_subject_assignments
    Class.belongsToMany(models.Faculty, {
      through: models.FacultySubjectAssignment || 'faculty_subject_assignments',
      foreignKey: 'class_id',
      otherKey: 'faculty_id',
      as: 'assignedFaculty',
    });
    // Class has class incharges (faculty incharges)
    Class.hasMany(models.ClassIncharge, {
      foreignKey: 'class_id',
      as: 'incharges',
    });
  };

  return Class;
};

export default ClassModel;