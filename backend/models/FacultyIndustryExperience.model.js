import { DataTypes } from 'sequelize';

const FacultyIndustryExperience = (sequelize) => {
  const IndustryExperience = sequelize.define('FacultyIndustryExperience', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'exp_id'
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job_title: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    period: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'faculty_industry_experience',
    timestamps: false,
  });

  IndustryExperience.associate = (models) => {
    IndustryExperience.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });
  };

  return IndustryExperience;
};

export default FacultyIndustryExperience;
