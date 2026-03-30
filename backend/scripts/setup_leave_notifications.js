import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'eduvertex',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    { host: process.env.MYSQL_HOST || 'localhost', dialect: 'mysql', logging: false }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected\n');

        // 1. Create leave_notifications table if missing
        const [tables] = await sequelize.query("SHOW TABLES LIKE 'leave_notifications'");
        if (tables.length === 0) {
            await sequelize.query(`
        CREATE TABLE \`leave_notifications\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`recipientId\` INT NULL,
          \`recipientType\` ENUM('faculty','department-admin','executiveadmin') NOT NULL,
          \`departmentId\` INT NULL,
          \`senderId\` INT NULL,
          \`senderName\` VARCHAR(150) NULL,
          \`leaveId\` INT NOT NULL,
          \`facultyName\` VARCHAR(150) NULL,
          \`leaveType\` VARCHAR(50) NULL,
          \`startDate\` DATE NULL,
          \`endDate\` DATE NULL,
          \`type\` ENUM('leave_submitted','leave_approved','leave_rejected','reassignment_requested','load_accepted','load_rejected') NOT NULL,
          \`title\` VARCHAR(200) NOT NULL,
          \`message\` TEXT NULL,
          \`isRead\` TINYINT(1) NOT NULL DEFAULT 0,
          \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
            console.log('✅ Created leave_notifications table');
        } else {
            console.log('⏭  leave_notifications table already exists');
        }

        // 2. Get leave id=4 details
        const [leaves] = await sequelize.query('SELECT * FROM leaves WHERE id=4 LIMIT 1');
        const leave = leaves[0];
        if (!leave) { console.log('Leave id=4 not found'); process.exit(0); }
        console.log('\nLeave id=4:', JSON.stringify(leave));

        // 3. Get faculty names
        const [facs] = await sequelize.query(
            `SELECT faculty_id, Name, department_id FROM faculty_profiles WHERE faculty_id IN (${leave.applicantId}, ${leave.reassign_faculty_id})`
        );
        console.log('Faculty:', JSON.stringify(facs));
        const applicant = facs.find(f => f.faculty_id == leave.applicantId);
        const reassign = facs.find(f => f.faculty_id == leave.reassign_faculty_id);

        // 4. Check if notification already exists for this leave
        const [existing] = await sequelize.query(
            `SELECT id FROM leave_notifications WHERE leaveId=4 AND recipientId=${leave.reassign_faculty_id} AND type='reassignment_requested' LIMIT 1`
        );

        if (existing.length > 0) {
            console.log('\n⏭  Notification already exists for VINOTH KUMAR J');
        } else {
            // Insert reassignment notification for VINOTH KUMAR J (reassign_faculty_id=404)
            const startStr = new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const endStr = new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

            await sequelize.query(`
        INSERT INTO leave_notifications 
          (recipientId, recipientType, departmentId, senderId, senderName, leaveId, facultyName, leaveType, startDate, endDate, type, title, message, isRead)
        VALUES
          (${leave.reassign_faculty_id}, 'faculty', ${leave.departmentId || 'NULL'}, ${leave.applicantId},
           '${applicant?.Name || 'Faculty'}', 4,
           '${applicant?.Name || 'Faculty'}', '${leave.leaveType}',
           '${leave.startDate?.toISOString?.()?.split('T')[0] || leave.startDate?.split('T')[0]}',
           '${leave.endDate?.toISOString?.()?.split('T')[0] || leave.endDate?.split('T')[0]}',
           'reassignment_requested',
           'Load Reassignment Request',
           '${applicant?.Name || 'Faculty'} has requested you to cover their classes from ${startStr} to ${endStr} due to ${leave.leaveType} leave.',
           0)
      `);
            console.log('\n✅ Created reassignment notification for', reassign?.Name || `faculty_id=${leave.reassign_faculty_id}`);
        }

        // Verify all notifications
        const [allNotifs] = await sequelize.query('SELECT * FROM leave_notifications ORDER BY id DESC LIMIT 10');
        console.log('\nAll notifications:');
        allNotifs.forEach(n => console.log(`  id=${n.id} recipient=${n.recipientId}(${n.recipientType}) type=${n.type} read=${n.isRead}`));

    } catch (e) {
        console.error('Error:', e.message);
        console.error(e.stack);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
