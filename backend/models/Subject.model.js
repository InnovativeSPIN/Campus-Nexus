import { DataTypes } from 'sequelize';

const Subject = (sequelize) => {
  const SubjectModel = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'subjects',
    timestamps: true,
  });

  SubjectModel.associate = (models) => {
    // Define associations here if needed
    SubjectModel.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });
  };

  return SubjectModel;
};

export default Subject;