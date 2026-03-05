import { DataTypes } from 'sequelize';

const StudentLeave = (sequelize) => {
    const StudentLeaveModel = sequelize.define('StudentLeave', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        leaveType: {
            type: DataTypes.ENUM('Leave', 'On-Duty'),
            defaultValue: 'Leave',
            allowNull: false
        },
        recipient: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        leaveSubType: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        attachment: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        startDate: { type: DataTypes.DATEONLY, allowNull: false },
        endDate: { type: DataTypes.DATEONLY, allowNull: false },
        totalDays: { type: DataTypes.DECIMAL(4, 1), allowNull: false },
        reason: { type: DataTypes.TEXT, allowNull: false },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
            defaultValue: 'pending',
        },
        approvedById: { type: DataTypes.INTEGER, allowNull: true },
        approvalRemarks: { type: DataTypes.STRING(500), allowNull: true },
        approvalDate: { type: DataTypes.DATE, allowNull: true },
    }, {
        tableName: 'student_leaves',
        timestamps: true,
    });

    StudentLeaveModel.associate = (models) => {
        StudentLeaveModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
        StudentLeaveModel.belongsTo(models.User, { foreignKey: 'approvedById', as: 'approvedBy' });
    };

    return StudentLeaveModel;
};

export default StudentLeave;
