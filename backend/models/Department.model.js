import { DataTypes } from 'sequelize';

const Department = (sequelize) => {
  const DepartmentModel = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    short_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: 'departments',
    timestamps: false, // The table doesn't have createdAt/updatedAt
  });

  DepartmentModel.associate = (models) => {
    // Define associations here if needed
    DepartmentModel.hasMany(models.Faculty, {
      foreignKey: 'department_id',
      as: 'faculty',
    });
    DepartmentModel.hasMany(models.Student, {
      foreignKey: 'departmentId',
      as: 'students',
    });
  };

  return DepartmentModel;
};

export default Department;