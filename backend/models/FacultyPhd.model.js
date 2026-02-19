import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const FacultyPhd = sequelize.define('FacultyPhd', {
    phd_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'faculty',
            key: 'faculty_id'
        }
    },
    status: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    orcid_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    thesis_title: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    register_no: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    guide_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'faculty_phd',
    timestamps: false
});

export default FacultyPhd;
