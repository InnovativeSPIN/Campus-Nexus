import { DataTypes } from 'sequelize';

const PortfolioNotification = (sequelize) => {
    const PortfolioNotificationModel = sequelize.define('PortfolioNotification', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        // Who receives this notification (the class incharge faculty user id)
        recipientId: { type: DataTypes.INTEGER, allowNull: false },
        // Who triggered this notification (the student profile id)
        senderId: { type: DataTypes.INTEGER, allowNull: false },
        senderName: { type: DataTypes.STRING(150), allowNull: true },
        // Item reference
        referenceId: { type: DataTypes.INTEGER, allowNull: false },
        referenceType: {
            type: DataTypes.ENUM('sport', 'event', 'certification', 'project'),
            allowNull: false
        },
        // Notification content
        type: {
            type: DataTypes.ENUM('submission', 'update'),
            defaultValue: 'submission',
        },
        title: { type: DataTypes.STRING(200), allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: true },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    }, {
        tableName: 'portfolio_notifications',
        timestamps: true,
    });

    PortfolioNotificationModel.associate = (models) => {
        PortfolioNotificationModel.belongsTo(models.Faculty, {
            foreignKey: 'recipientId',
            as: 'recipient',
        });
        PortfolioNotificationModel.belongsTo(models.Student, {
            foreignKey: 'senderId',
            as: 'sender',
        });
    };

    return PortfolioNotificationModel;
};

export default PortfolioNotification;
