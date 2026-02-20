import { DataTypes } from 'sequelize';

const Role = (sequelize) => {
  const RoleModel = sequelize.define('Role', {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  }, {
    tableName: 'roles',
    timestamps: false, // No timestamps in table
  });

  RoleModel.associate = (models) => {
    RoleModel.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
  };

  return RoleModel;
};

export default Role;