import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/db.js';
import { QueryTypes } from 'sequelize';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✓ DB connected');

    // Check if subjects table exists
    const [tables] = await sequelize.query(`SHOW TABLES LIKE 'subjects';`);
    
    if (tables.length === 0) {
      // Table doesn't exist - create it
      console.log('\n⚠️  Subjects table does not exist, creating...');
      const ddl = `CREATE TABLE \`subjects\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`code\` varchar(20) NOT NULL,
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
        UNIQUE KEY \`uq_code\` (\`code\`),
        KEY \`department_id\` (\`department_id\`),
        KEY \`class_id\` (\`class_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;

      await sequelize.query(ddl, { type: QueryTypes.RAW });
      console.log('✓ Subjects table created with correct schema');
    } else {
      // Table exists - check and add missing constraints/columns safely
      console.log('\n🔄 Subjects table exists. Checking schema...');
      
      // Check if UNIQUE constraint on code exists
      try {
        await sequelize.query(
          'ALTER TABLE subjects ADD CONSTRAINT uq_subjects_code UNIQUE (code);',
          { type: QueryTypes.RAW }
        );
        console.log('✓ Added UNIQUE constraint on code column');
      } catch (err) {
        if (err.message.includes('Duplicate key name') || err.message.includes('already exists')) {
          console.log('✓ UNIQUE constraint on code already exists');
        } else {
          console.log('Note: Could not add constraint:', err.message);
        }
      }
      
      // Check if is_elective column exists, add if missing
      try {
        await sequelize.query(
          'ALTER TABLE subjects ADD COLUMN is_elective tinyint(1) NOT NULL DEFAULT 0 AFTER type;',
          { type: QueryTypes.RAW }
        );
        console.log('✓ Added is_elective column');
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log('✓ is_elective column already exists');
        } else {
          console.log('Note: Could not add is_elective:', err.message);
        }
      }
      
      // Check if is_laboratory column exists, add if missing
      try {
        await sequelize.query(
          'ALTER TABLE subjects ADD COLUMN is_laboratory tinyint(1) NOT NULL DEFAULT 0 AFTER is_elective;',
          { type: QueryTypes.RAW }
        );
        console.log('✓ Added is_laboratory column');
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log('✓ is_laboratory column already exists');
        } else {
          console.log('Note: Could not add is_laboratory:', err.message);
        }
      }
      
      console.log('✓ Subjects table schema updated safely (no data loss)');
    }

    console.log('\n✓ All done! Subjects table is now ready.');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message || err);
    process.exit(1);
  }
}

run();
