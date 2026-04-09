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
    // Stored as TEXT/LONGTEXT in DB to avoid ENUM mismatch issues
    type: {
      type: DataTypes.STRING(50),
      defaultValue: 'general',
    },
    // Stored as TEXT/STRING — avoids ENUM sync issues with MySQL
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: 'normal',
    },
    // JSON array of roles e.g. ["student"], ["faculty"], ["all"]
    targetRole: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['all'],
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    year: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    term: {
      type: DataTypes.STRING(10),
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
    // Never alter the existing table schema automatically
    freezeTableName: true,
  });

  AnnouncementModel.associate = (models) => {
    AnnouncementModel.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy',
    });
  };

  return AnnouncementModel;
};

export default Announcement;