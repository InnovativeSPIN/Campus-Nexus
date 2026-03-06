import { DataTypes } from 'sequelize';

const StudentEvent = (sequelize) => {
    const StudentEventModel = sequelize.define('StudentEvent', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        eventName: { type: DataTypes.STRING(200), allowNull: false },
        eventType: {
            type: DataTypes.ENUM('cultural', 'technical', 'sports', 'social', 'workshop', 'seminar', 'other'),
            defaultValue: 'other',
        },
        organizer: { type: DataTypes.STRING(150), allowNull: true },
        eventDate: { type: DataTypes.DATEONLY, allowNull: false },
        role: {
            type: DataTypes.ENUM('participant', 'organizer', 'volunteer', 'speaker', 'judge', 'other'),
            defaultValue: 'participant',
        },
        achievement: { type: DataTypes.STRING(300), allowNull: true },
        level: {
            type: DataTypes.ENUM('college', 'district', 'state', 'national', 'international'),
            defaultValue: 'college',
        },
        certificateUrl: { type: DataTypes.STRING(500), allowNull: true },
        classId: { type: DataTypes.INTEGER, allowNull: true },
        approvalStatus: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        approvedById: { type: DataTypes.INTEGER, allowNull: true },
        approvalRemarks: { type: DataTypes.STRING(500), allowNull: true },
        approvalDate: { type: DataTypes.DATE, allowNull: true },
    }, {
        tableName: 'student_events',
        timestamps: true,
    });

    StudentEventModel.associate = (models) => {
        StudentEventModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
        StudentEventModel.belongsTo(models.Faculty, { foreignKey: 'approvedById', as: 'approvedBy' });
        StudentEventModel.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    };

    return StudentEventModel;
};

export default StudentEvent;
