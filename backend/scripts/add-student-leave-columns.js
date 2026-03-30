import connectDB from '../config/db.js';
import { sequelize } from '../models/index.js';

(async () => {
  try {
    await connectDB();

    await sequelize.query(`
      ALTER TABLE student_leaves
        ADD COLUMN classId INT NULL,
        ADD COLUMN overall_status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
        ADD COLUMN class_incharge_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        ADD COLUMN class_incharge_id INT NULL,
        ADD COLUMN class_incharge_remarks TEXT NULL,
        ADD COLUMN class_incharge_approval_date DATETIME NULL,
        ADD COLUMN department_admin_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        ADD COLUMN department_admin_id INT NULL,
        ADD COLUMN department_admin_remarks TEXT NULL,
        ADD COLUMN department_admin_approval_date DATETIME NULL;
    `);

    console.log('Schema updated: student_leaves columns added.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
})();
