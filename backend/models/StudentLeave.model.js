import { DataTypes } from 'sequelize';

const StudentLeave = (sequelize) => {
    const StudentLeaveModel = sequelize.define('StudentLeave', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        classId: { type: DataTypes.INTEGER, allowNull: false },
        leaveType: {
            type: DataTypes.ENUM('Medical', 'Casual', 'On-Duty', 'Special', 'Other'),
            defaultValue: 'Casual',
            allowNull: false
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
        // Multi-level approval fields
        overall_status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
            defaultValue: 'pending',
        },
        submitted_to: {
            type: DataTypes.ENUM('Class Incharge', 'Faculty Advisor', 'HOD'),
            defaultValue: 'Class Incharge',
        },
        // Approval tracking
        class_incharge_approval_status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        class_incharge_id: { type: DataTypes.INTEGER, allowNull: true },
        class_incharge_remarks: { type: DataTypes.TEXT, allowNull: true },
        class_incharge_approval_date: { type: DataTypes.DATE, allowNull: true },
        
        department_admin_approval_status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        department_admin_id: { type: DataTypes.INTEGER, allowNull: true },
        department_admin_remarks: { type: DataTypes.TEXT, allowNull: true },
        department_admin_approval_date: { type: DataTypes.DATE, allowNull: true },
    }, {
        tableName: 'student_leaves',
        timestamps: true
    });

    StudentLeaveModel.associate = (models) => {
        StudentLeaveModel.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
        StudentLeaveModel.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
        StudentLeaveModel.belongsTo(models.Faculty, { 
            foreignKey: 'class_incharge_id', 
            as: 'classInchargeApprover',
            targetKey: 'faculty_id'
        });
        StudentLeaveModel.belongsTo(models.Faculty, { 
            foreignKey: 'department_admin_id', 
            as: 'deptAdminApprover',
            targetKey: 'faculty_id'
        });
    };

    return StudentLeaveModel;
};

export default StudentLeave;
