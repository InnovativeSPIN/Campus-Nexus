import { DataTypes } from 'sequelize';

const Announcement = (sequelize) => {
  const AnnouncementModel = sequelize.define('Announcement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('academic', 'leave', 'fee', 'general', 'disciplinary', 'attendance', 'result', 'approval', 'announcement'),
      defaultValue: 'general',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'low',
    },
    targetRole: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['all'],
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    creatorRole: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'announcements',
    timestamps: true,
  });

  AnnouncementModel.associate = (models) => {
    // Define associations here if needed
    AnnouncementModel.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy',
    });
  };

  return AnnouncementModel;
};

export default Announcement;