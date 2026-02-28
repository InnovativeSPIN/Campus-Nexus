import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function setupLeaveTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eduvertex',
  });

  try {
    console.log('Setting up leave request and approval tables...\n');

    // Create leaves table
    const leavesSQL = `
      CREATE TABLE IF NOT EXISTS \`leaves\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`applicantId\` int(11) NOT NULL COMMENT 'Faculty ID or Student ID',
        \`departmentId\` int(11) COMMENT 'Department ID of the applicant',
        \`leaveType\` enum('Medical','Casual','Earned','On-Duty','Personal','Maternity','Comp-Off') NOT NULL DEFAULT 'Casual',
        \`startDate\` datetime NOT NULL,
        \`endDate\` datetime NOT NULL,
        \`totalDays\` decimal(4,1) NOT NULL,
        \`reason\` text NOT NULL,
        \`status\` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
        \`applicantType\` enum('faculty','student') NOT NULL DEFAULT 'faculty',
        \`approvedById\` int(11) COMMENT 'ID of the admin/HOD who approved',
        \`approvalDate\` datetime COMMENT 'When the leave was approved/rejected',
        \`approvalRemarks\` text COMMENT 'Remarks from the approver',
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        PRIMARY KEY (\`id\`),
        KEY \`idx_applicantId\` (\`applicantId\`),
        KEY \`idx_departmentId\` (\`departmentId\`),
        KEY \`idx_status\` (\`status\`),
        KEY \`idx_leaveType\` (\`leaveType\`),
        KEY \`idx_startDate\` (\`startDate\`),
        KEY \`idx_endDate\` (\`endDate\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(leavesSQL);
    console.log('✓ Created "leaves" table');

    // Create leave_balance table
    const balanceSQL = `
      CREATE TABLE IF NOT EXISTS \`leave_balance\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`userId\` int(11) NOT NULL COMMENT 'Faculty ID or Student ID',
        \`userType\` enum('faculty','student') NOT NULL DEFAULT 'faculty',
        \`academicYear\` varchar(9) NOT NULL COMMENT 'Academic year in format YYYY',
        
        \`Medical\` longtext COMMENT 'JSON: {balance: 10, used: 0}',
        \`Casual\` longtext COMMENT 'JSON: {balance: 12, used: 0}',
        \`Earned\` longtext COMMENT 'JSON: {balance: 15, used: 0}',
        \`On-Duty\` longtext COMMENT 'JSON: {balance: 10, used: 0}',
        \`Personal\` longtext COMMENT 'JSON: {balance: 5, used: 0}',
        \`Maternity\` longtext COMMENT 'JSON: {balance: 90, used: 0}',
        \`Comp-Off\` longtext COMMENT 'JSON: {balance: 0, used: 0}',
        
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`unique_user_year\` (\`userId\`, \`academicYear\`),
        KEY \`idx_userId\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(balanceSQL);
    console.log('✓ Created "leave_balance" table');

    // Insert sample data
    const sampleData = `
      INSERT IGNORE INTO \`leaves\` 
      (applicantId, departmentId, leaveType, startDate, endDate, totalDays, reason, status, applicantType, createdAt) 
      VALUES
      (1, 1, 'Medical', '2026-03-01 09:00:00', '2026-03-02 17:00:00', 2, 'Medical emergency - dental appointment', 'pending', 'faculty', NOW()),
      (1, 1, 'Casual', '2026-02-15 09:00:00', '2026-02-17 17:00:00', 3, 'Family visit', 'pending', 'faculty', NOW()),
      (2, 2, 'On-Duty', '2026-03-10 09:00:00', '2026-03-12 17:00:00', 3, 'Conference attendance at IIIT Delhi', 'pending', 'faculty', NOW());
    `;

    await connection.query(sampleData);
    console.log('✓ Inserted sample leave data');

    // Insert sample balance data
    const balanceData = `
      INSERT IGNORE INTO \`leave_balance\` 
      (userId, userType, academicYear, Medical, Casual, Earned, \`On-Duty\`, Personal, Maternity, \`Comp-Off\`) 
      VALUES
      (1, 'faculty', '2026', '{\"balance\":10,\"used\":0}', '{\"balance\":12,\"used\":0}', '{\"balance\":15,\"used\":0}', '{\"balance\":10,\"used\":0}', '{\"balance\":5,\"used\":0}', '{\"balance\":90,\"used\":0}', '{\"balance\":0,\"used\":0}'),
      (2, 'faculty', '2026', '{\"balance\":10,\"used\":0}', '{\"balance\":12,\"used\":0}', '{\"balance\":15,\"used\":0}', '{\"balance\":10,\"used\":0}', '{\"balance\":5,\"used\":0}', '{\"balance\":90,\"used\":0}', '{\"balance\":0,\"used\":0}');
    `;

    await connection.query(balanceData);
    console.log('✓ Inserted sample balance data');

    console.log('\n✓ All tables created successfully!');
    console.log('\nLeave Request & Approval Flow is ready:');
    console.log('  1. Faculty submits leave request → stored in "leaves" table');
    console.log('  2. Department Admin reviews pending leaves');
    console.log('  3. Department Admin approves/rejects leave');
    console.log('  4. Leave balance is updated in "leave_balance" table');

  } catch (error) {
    console.error('Error setting up tables:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupLeaveTables();
