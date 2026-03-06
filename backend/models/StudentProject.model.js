import { DataTypes } from 'sequelize';

const StudentProject = (sequelize) => {
    const StudentProjectModel = sequelize.define('StudentProject', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING(200), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        role: { type: DataTypes.STRING(100), allowNull: true },
        techStack: { type: DataTypes.JSON, allowNull: true },
        startDate: { type: DataTypes.DATEONLY, allowNull: true },
        endDate: { type: DataTypes.DATEONLY, allowNull: true },
        demoUrl: { type: DataTypes.STRING(500), allowNull: true },
        repoUrl: { type: DataTypes.STRING(500), allowNull: true },
        status: {
            type: DataTypes.ENUM('in-progress', 'completed', 'planned', 'paused'),
            defaultValue: 'in-progress',
        },
        approvalStatus: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        classId: { type: DataTypes.INTEGER, allowNull: true },
        approvedById: { type: DataTypes.INTEGER, allowNull: true },
        approvalRemarks: { type: DataTypes.STRING(500), allowNull: true },
        approvalDate: { type: DataTypes.DATE, allowNull: true },
    }, {
        tableName: 'student_projects',
        timestamps: true,
    });

    StudentProjectModel.associate = (models) => {
        StudentProjectModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
        StudentProjectModel.belongsTo(models.Faculty, { foreignKey: 'approvedById', as: 'approvedBy' });
        StudentProjectModel.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    };

    return StudentProjectModel;
};

export default StudentProject;
