import { DataTypes } from 'sequelize';

const FacultyExperience = (sequelize) => {
    const Experience = sequelize.define('FacultyExperience', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'exp_id'
        },
        faculty_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Teaching fields
        designation: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        institution_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        university: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        department: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        // Industry fields were moved to separate table `faculty_industry_experience`
        // Common experience fields
        from_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        to_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        period: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        is_current: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_current'
        }
    }, {
        tableName: 'faculty_experience',
        timestamps: false,
    });

    Experience.associate = (models) => {
        Experience.belongsTo(models.Faculty, {
            foreignKey: 'faculty_id',
            as: 'faculty',
        });
    };

    return Experience;
};

export default FacultyExperience;
