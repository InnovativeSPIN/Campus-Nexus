import { DataTypes } from 'sequelize';

const FacultyEvents = (sequelize) => {
    const Events = sequelize.define('FacultyEvents', {
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        faculty_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM('Resource Person', 'FDP', 'Seminar', 'Workshop'),
            allowNull: false,
        },
        organizer_type: {
            type: DataTypes.ENUM('organized', 'participated'),
            defaultValue: 'participated',
            allowNull: true,
        },
        event_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        organizer: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        event_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        document_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'faculty_events',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Events;
};

export default FacultyEvents;
