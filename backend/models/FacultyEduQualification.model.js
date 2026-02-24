import { DataTypes } from 'sequelize';

const FacultyEduQualification = (sequelize) => {
    const EduQualification = sequelize.define('FacultyEduQualification', {
        membership_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            primaryKey: true,
            autoIncrement: true,
        },
        faculty_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        degree: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        branch: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        college: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        university: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        year: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        percentage: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        society_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('Active', 'Inactive'),
            defaultValue: 'Active',
        },
    }, {
        tableName: 'faculy_edu_qualification', // Matches the typo in the DB
        timestamps: false, // Table doesn't have timestamps in SQL dump
    });

    EduQualification.associate = (models) => {
        EduQualification.belongsTo(models.Faculty, {
            foreignKey: 'faculty_id',
            as: 'faculty',
        });
    };

    return EduQualification;
};

export default FacultyEduQualification;
