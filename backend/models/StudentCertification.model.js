import { DataTypes } from 'sequelize';

const StudentCertification = (sequelize) => {
    const StudentCertificationModel = sequelize.define('StudentCertification', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING(200), allowNull: false },
        issuer: { type: DataTypes.STRING(150), allowNull: false },
        issueDate: { type: DataTypes.DATEONLY, allowNull: false },
        expiryDate: { type: DataTypes.DATEONLY, allowNull: true },
        credentialId: { type: DataTypes.STRING(100), allowNull: true },
        credentialUrl: { type: DataTypes.STRING(500), allowNull: true },
        skills: { type: DataTypes.JSON, allowNull: true },
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
        tableName: 'student_certifications',
        timestamps: true,
    });

    StudentCertificationModel.associate = (models) => {
        StudentCertificationModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
        StudentCertificationModel.belongsTo(models.Faculty, { foreignKey: 'approvedById', as: 'approvedBy' });
        StudentCertificationModel.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    };

    return StudentCertificationModel;
};

export default StudentCertification;
