import { DataTypes } from 'sequelize';

const StudentInternalMark = (sequelize) => {
    const StudentInternalMarkModel = sequelize.define('StudentInternalMark', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        subjectId: { type: DataTypes.INTEGER, allowNull: false },
        semester: { type: DataTypes.INTEGER, allowNull: false },
        academicYear: { type: DataTypes.STRING(9), allowNull: false },
        internalNumber: { type: DataTypes.INTEGER, allowNull: false },
        internalScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
        assessmentScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
        totalScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
        remarks: { type: DataTypes.STRING(255), allowNull: true },
        internal100: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
        assignment1: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
        assignment2: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
        workingHours: { type: DataTypes.INTEGER, defaultValue: 60 },
        presentHours: { type: DataTypes.INTEGER, defaultValue: 0 },
        attendancePercentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
        status: {
            type: DataTypes.ENUM('draft', 'submitted', 'verified', 'published', 'rejected'),
            defaultValue: 'draft',
            allowNull: false
        },
        submittedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'submitted_by'
        },
        submittedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'submitted_at'
        },
        verifiedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'verified_by'
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verified_at'
        },
        publishedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'published_by'
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'published_at'
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'rejection_reason'
        },
        classId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'classId'
        }
    }, {
        tableName: 'student_internal_marks',
        timestamps: true,
    });

    StudentInternalMarkModel.associate = (models) => {
        StudentInternalMarkModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
        StudentInternalMarkModel.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
        StudentInternalMarkModel.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
        StudentInternalMarkModel.belongsTo(models.Faculty, { foreignKey: 'submitted_by', as: 'submittedByFaculty', targetKey: 'faculty_id' });
    };

    return StudentInternalMarkModel;
};

export default StudentInternalMark;
