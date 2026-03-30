import connectDB from './config/db.js';
import { sequelize } from './config/db.js';

const migrate = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Create leave_notifications table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS leave_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipientId INT NULL,
        recipientType ENUM('faculty','department-admin','executiveadmin') NOT NULL,
        departmentId INT NULL,
        senderId INT NULL,
        senderName VARCHAR(150) NULL,
        leaveId INT NOT NULL,
        facultyName VARCHAR(150) NULL,
        leaveType VARCHAR(50) NULL,
        startDate DATE NULL,
        endDate DATE NULL,
        type ENUM('leave_submitted','leave_approved','leave_rejected', 'reassignment_requested', 'load_accepted', 'load_rejected') NOT NULL,

        title VARCHAR(200) NOT NULL,
        message TEXT NULL,
        isRead TINYINT(1) NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_recipient (recipientId, recipientType),
        INDEX idx_department (departmentId, recipientType),
        INDEX idx_leave (leaveId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('leave_notifications table created (or already exists)');

    // Add reassign_faculty_id to leaves
    try {
      await sequelize.query(`ALTER TABLE leaves ADD COLUMN reassign_faculty_id INT NULL COMMENT 'Faculty who covers during leave'`);
      console.log('reassign_faculty_id column added to leaves');
    } catch (e) {
      if (e.message && (e.message.includes('Duplicate column') || e.message.includes('already exists'))) {
        console.log('reassign_faculty_id already exists - skipping');
      } else {
        throw e;
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();
