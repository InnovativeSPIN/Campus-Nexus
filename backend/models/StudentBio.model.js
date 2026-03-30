import { DataTypes } from 'sequelize';

const StudentBio = (sequelize) => {
    const StudentBioModel = sequelize.define('StudentBio', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
        alternatePhone: { type: DataTypes.STRING(20), allowNull: true },
        linkedinUrl: { type: DataTypes.STRING(255), allowNull: true },
        dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
        bloodGroup: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'), allowNull: true },
        nationality: { type: DataTypes.STRING(60), allowNull: true },
        religion: { type: DataTypes.STRING(60), allowNull: true },
        category: { type: DataTypes.STRING(30), allowNull: true },
        aadharNo: { type: DataTypes.STRING(20), allowNull: true },
        motherTongue: { type: DataTypes.STRING(60), allowNull: true },
        residenceType: { type: DataTypes.ENUM('hosteller', 'day_scholar', 'other'), allowNull: true },
        address: { type: DataTypes.JSON, allowNull: true },
        permanentAddress: { type: DataTypes.JSON, allowNull: true },
        parentInfo: { type: DataTypes.JSON, allowNull: true, field: 'parentinfo' },
        references: { type: DataTypes.JSON, allowNull: true },
        familyPhoto: { type: DataTypes.STRING(255), allowNull: true, field: 'family_photo' },
        siblings: { type: DataTypes.JSON, allowNull: true },
        previousEducation: { type: DataTypes.JSON, allowNull: true },
        scholarshipDetails: { type: DataTypes.JSON, allowNull: true },
        documents: { type: DataTypes.JSON, allowNull: true },
    }, {
        tableName: 'student_bio',
        timestamps: true,
    });

    StudentBioModel.associate = (models) => {
        StudentBioModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    };

    return StudentBioModel;
};

export default StudentBio;
