import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/db.js';
import { QueryTypes } from 'sequelize';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✓ DB connected');

    // List of critical tables needed for the app
    const tables = [
      {
        name: 'subjects',
        ddl: `CREATE TABLE IF NOT EXISTS \`subjects\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`code\` varchar(20) NOT NULL UNIQUE,
          \`name\` varchar(255) NOT NULL,
          \`description\` text DEFAULT NULL,
          \`department_id\` int(11) NOT NULL,
          \`semester\` tinyint(2) DEFAULT NULL COMMENT '1-8 semesters',
          \`class_id\` int(11) DEFAULT NULL,
          \`credits\` int(11) DEFAULT NULL,
          \`type\` enum('Theory','Practical','Theory+Practical') DEFAULT 'Theory',
          \`is_elective\` tinyint(1) NOT NULL DEFAULT 0,
          \`is_laboratory\` tinyint(1) NOT NULL DEFAULT 0,
          \`min_hours_per_week\` int(11) DEFAULT 3,
          \`max_students\` int(11) DEFAULT NULL,
          \`status\` enum('active','inactive','archived') DEFAULT 'active',
          \`created_by\` int(11) NOT NULL DEFAULT 1,
          \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
          \`updated_at\` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (\`id\`),
          KEY \`department_id\` (\`department_id\`),
          KEY \`class_id\` (\`class_id\`),
          KEY \`code\` (\`code\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
      },
      {
        name: 'timetable_slots',
        ddl: `CREATE TABLE IF NOT EXISTS \`timetable_slots\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`timetable_id\` int(11) NOT NULL,
          \`day\` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
          \`period_number\` int(11) NOT NULL,
          \`start_time\` time NOT NULL,
          \`end_time\` time NOT NULL,
          \`subject_id\` int(11) DEFAULT NULL,
          \`faculty_id\` int(11) DEFAULT NULL,
          \`class_id\` int(11) DEFAULT NULL,
          \`room\` varchar(50) DEFAULT NULL,
          \`type\` enum('lecture','lab','tutorial') DEFAULT 'lecture',
          \`status\` enum('active','cancelled') DEFAULT 'active',
          \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
          \`updated_at\` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (\`id\`),
          KEY \`timetable_id\` (\`timetable_id\`),
          KEY \`faculty_id\` (\`faculty_id\`),
          KEY \`subject_id\` (\`subject_id\`),
          KEY \`class_id\` (\`class_id\`),
          CONSTRAINT \`fk_timetable_slots_timetable\` FOREIGN KEY (\`timetable_id\`) REFERENCES \`timetables\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
      },
      {
        name: 'timetable_slot_assignments',
        ddl: `CREATE TABLE IF NOT EXISTS \`timetable_slot_assignments\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`timetable_id\` int(11) NOT NULL,
          \`class_id\` int(11) NOT NULL,
          \`subject_code\` varchar(20) NOT NULL,
          \`subject_name\` varchar(255) NOT NULL,
          \`faculty_id\` int(11) NOT NULL,
          \`assigned_by\` int(11) NOT NULL,
          \`day_of_week\` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
          \`start_time\` time NOT NULL,
          \`end_time\` time NOT NULL,
          \`room_number\` varchar(50) DEFAULT NULL,
          \`year\` varchar(20) DEFAULT NULL,
          \`status\` enum('active','pending_approval','rejected') DEFAULT 'pending_approval',
          \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
          \`updated_at\` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (\`id\`),
          KEY \`timetable_id\` (\`timetable_id\`),
          KEY \`faculty_id\` (\`faculty_id\`),
          KEY \`class_id\` (\`class_id\`),
          CONSTRAINT \`fk_slot_assignments_timetable\` FOREIGN KEY (\`timetable_id\`) REFERENCES \`timetables\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
      },
      {
        name: 'timetable_notifications',
        ddl: `CREATE TABLE IF NOT EXISTS \`timetable_notifications\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`slot_assignment_id\` int(11) NOT NULL,
          \`subject_code\` varchar(20) NOT NULL,
          \`subject_name\` varchar(255) NOT NULL,
          \`class_id\` int(11) NOT NULL,
          \`faculty_id\` int(11) NOT NULL,
          \`requested_by\` int(11) NOT NULL,
          \`status\` enum('pending','approved','rejected') DEFAULT 'pending',
          \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
          \`updated_at\` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (\`id\`),
          KEY \`faculty_id\` (\`faculty_id\`),
          KEY \`slot_assignment_id\` (\`slot_assignment_id\`),
          CONSTRAINT \`fk_notifications_assignment\` FOREIGN KEY (\`slot_assignment_id\`) REFERENCES \`timetable_slot_assignments\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
      }
    ];

    console.log('\nChecking and creating missing tables...\n');

    for (const table of tables) {
      try {
        const result = await sequelize.query(`SHOW TABLES LIKE '${table.name}';`, {
          type: QueryTypes.SELECT
        });

        if (result.length > 0) {
          console.log(`✓ Table '${table.name}' exists`);
        } else {
          console.log(`⚠️  Table '${table.name}' missing, creating...`);
          await sequelize.query(table.ddl);
          console.log(`✓ Table '${table.name}' created`);
        }
      } catch (err) {
        console.error(`✗ Error with table ${table.name}:`, err.message);
      }
    }

    // Verify timetables has AUTO_INCREMENT
    console.log('\nVerifying timetables table...');
    const tt = await sequelize.query("SHOW CREATE TABLE timetables;", {
      type: QueryTypes.SELECT
    });
    const ttDdl = tt[0]['Create Table'];
    if (/AUTO_INCREMENT/.test(ttDdl)) {
      console.log('✓ timetables.id has AUTO_INCREMENT');
    } else {
      console.log('⚠️  timetables.id missing AUTO_INCREMENT');
    }

    console.log('\n✓ All tables initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message || err);
    process.exit(1);
  }
}

run();
