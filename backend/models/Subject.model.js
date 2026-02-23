import { DataTypes } from 'sequelize';

const Subject = (sequelize) => {
  const SubjectModel = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 8
      }
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10
      }
    },
    type: {
      type: DataTypes.ENUM('Theory', 'Practical', 'Theory+Practical'),
      defaultValue: 'Theory',
    },
    is_elective: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'subjects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  SubjectModel.associate = (models) => {
    // Subject belongs to Department
    SubjectModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });

    // Subject can be assigned to many faculty through faculty_subject_assignments
    SubjectModel.belongsToMany(models.Faculty, {
      through: 'faculty_subject_assignments',
      foreignKey: 'subject_id',
      otherKey: 'faculty_id',
      as: 'assignedFaculty',
    });
  };

  return SubjectModel;
};

export default Subject;