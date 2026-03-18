import { sequelize } from './config/db.js';

const fixEnums = async () => {
    try {
        console.log("Fixing leaveType ENUM...");
        await sequelize.query("ALTER TABLE student_leaves MODIFY COLUMN leaveType ENUM('Medical', 'Casual', 'On-Duty', 'Special', 'Other', 'Leave', 'Personal', 'Earned') NOT NULL DEFAULT 'Casual'");
        
        console.log("Fixing submitted_to ENUM...");
        await sequelize.query("ALTER TABLE student_leaves MODIFY COLUMN submitted_to ENUM('Class Incharge', 'Faculty Advisor', 'HOD') DEFAULT 'Class Incharge'");
        
        console.log("Fixing overall_status ENUM...");
        await sequelize.query("ALTER TABLE student_leaves MODIFY COLUMN overall_status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending'");
        
        console.log("Fixing approval statuses...");
        await sequelize.query("ALTER TABLE student_leaves MODIFY COLUMN class_incharge_approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
        await sequelize.query("ALTER TABLE student_leaves MODIFY COLUMN department_admin_approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");

        console.log("ENUM FIXED SUCCESSFULLY!");
        process.exit(0);
    } catch (error) {
        console.error("ERROR FIXING ENUMS:", error.message);
        process.exit(1);
    }
};

fixEnums();
