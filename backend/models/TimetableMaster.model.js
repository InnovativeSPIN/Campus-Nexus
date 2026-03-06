import { DataTypes } from 'sequelize';

const TimetableMaster = (sequelize) => {
  const TimetableMasterModel = sequelize.define('TimetableMaster', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    semester: {
      type: DataTypes.ENUM('odd', 'even'),
      allowNull: false
    },
    department_id: DataTypes.INTEGER,
    year: {
      type: DataTypes.ENUM('1st', '2nd', '3rd', '4th'),
      allowNull: true
    },
    timetable_incharge_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('draft', 'pending_approval', 'active', 'inactive'),
      defaultValue: 'draft'
    },
    approved_by: DataTypes.INTEGER,
    approved_at: DataTypes.DATE,
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'timetable_master',
    timestamps: true
  });

  TimetableMasterModel.associate = (models) => {
    TimetableMasterModel.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department'
    });
    TimetableMasterModel.belongsTo(models.User, {
      foreignKey: 'timetable_incharge_id',
      as: 'incharge'
    });
    TimetableMasterModel.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    TimetableMasterModel.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });
    TimetableMasterModel.hasMany(models.TimetableDetails, {
      foreignKey: 'timetable_id',
      as: 'details'
    });
  };

  return TimetableMasterModel;
};

export default TimetableMaster;
