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
    hooks: {
      afterCreate: async (classInstance) => {
        if (classInstance.status === 'active' && classInstance.department_id && classInstance.semester && classInstance.batch) {
          try {
            const StudentModel = sequelize.models.Student;
            if (StudentModel) {
              await StudentModel.update(
                { classId: classInstance.id },
                {
                  where: {
                    departmentId: classInstance.department_id,
                    semester: classInstance.semester,
                    batch: classInstance.batch,
                    classId: null
                  }
                }
              );
            }
          } catch (err) {
            console.error('Error auto-mapping students in Class afterCreate:', err);
          }
        }
      },
      afterUpdate: async (classInstance) => {
        if (classInstance.changed('status') || classInstance.changed('department_id') || classInstance.changed('semester') || classInstance.changed('batch')) {
          if (classInstance.status === 'active' && classInstance.department_id && classInstance.semester && classInstance.batch) {
            try {
              const StudentModel = sequelize.models.Student;
              if (StudentModel) {
                await StudentModel.update(
                  { classId: classInstance.id },
                  {
                    where: {
                      departmentId: classInstance.department_id,
                      semester: classInstance.semester,
                      batch: classInstance.batch,
                      classId: null
                    }
                  }
                );
              }
            } catch (err) {
              console.error('Error auto-mapping students in Class afterUpdate:', err);
            }
          }
        }
      }
    }
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