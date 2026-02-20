import { DataTypes } from 'sequelize';

const ClassModel = (sequelize) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    room: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    batch: {
      type: DataTypes.STRING(20),
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
  }, {
    tableName: 'classes',
    timestamps: false, // The table doesn't have createdAt/updatedAt
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
  };

  return Class;
};

export default ClassModel;