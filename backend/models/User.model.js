import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const User = (sequelize) => {
  const UserModel = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  UserModel.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  UserModel.prototype.getSignedJwtToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  };

  UserModel.associate = (models) => {
    UserModel.belongsTo(models.Role, { foreignKey: 'role_id', targetKey: 'role_id', as: 'role' });
    UserModel.hasMany(models.Announcement, {
      foreignKey: 'createdById',
      as: 'announcements'
    });
  };

  return UserModel;
};

export default User;