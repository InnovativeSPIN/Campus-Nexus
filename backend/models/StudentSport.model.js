import { DataTypes } from 'sequelize';

const StudentSport = (sequelize) => {
    const StudentSportModel = sequelize.define('StudentSport', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING(100), allowNull: false },
        category: {
            type: DataTypes.ENUM('Team Sports', 'Individual Sports', 'Aquatics', 'Combat Sports', 'Other'),
            defaultValue: 'Other',
        },
        joinedDate: { type: DataTypes.DATEONLY, allowNull: false },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
        },
        achievements: { type: DataTypes.STRING(500), allowNull: true },
        level: {
            type: DataTypes.ENUM('college', 'district', 'state', 'national', 'international'),
            defaultValue: 'college',
        },
        documentUrl: { type: DataTypes.STRING(500), allowNull: true },
        classId: { type: DataTypes.INTEGER, allowNull: true },
        approvalStatus: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        approvedById: { type: DataTypes.INTEGER, allowNull: true },
        approvalRemarks: { type: DataTypes.STRING(500), allowNull: true },
        approvalDate: { type: DataTypes.DATE, allowNull: true },
    }, {
        tableName: 'student_sports',
        timestamps: true,
    });

    StudentSportModel.associate = (models) => {
        StudentSportModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
        StudentSportModel.belongsTo(models.Faculty, { foreignKey: 'approvedById', as: 'approvedBy' });
        StudentSportModel.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    };

    return StudentSportModel;
};

export default StudentSport;
