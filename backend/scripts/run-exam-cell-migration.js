import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

const runMigration = async () => {
  try {
    console.log('🚀 Starting Exam Cell Admin Database Migration...\n');

    // 1. Create the exam-cell-admin role
    console.log('Step 1: Checking and inserting exam-cell-admin role...');
    await sequelize.query(`
      INSERT IGNORE INTO \`roles\` (\`role_id\`, \`role_name\`) 
      VALUES (8, 'exam-cell-admin');
    `);
    console.log('✅ Role set up successfully.');

    // 2. Check and insert Exam Cell Admin user
    console.log('\nStep 2: Checking and inserting Exam Cell Admin user...');
    const [existingUsers] = await sequelize.query(`
      SELECT * FROM \`users\` WHERE \`email\` = 'examcell@nscet.org';
    `);

    if (existingUsers.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await sequelize.query(`
        INSERT INTO \`users\` (\`name\`, \`email\`, \`password\`, \`role_id\`, \`phone\`, \`isActive\`)
        VALUES ('Exam Cell Admin', 'examcell@nscet.org', '${hashedPassword}', 8, '9876543211', 1);
      `);
      console.log('✅ Exam Cell Admin user created successfully (Password: password123)');
    } else {
      console.log('ℹ️ Exam Cell Admin user already exists.');
    }

    // 3. Alter student_internal_marks table
    console.log('\nStep 3: Checking and altering student_internal_marks table...');
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM \`student_internal_marks\`;
    `);
    
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('status')) {
      console.log('   Adding status and metadata columns to student_internal_marks...');
      
      // Let's check if foreign key constraint exists or we need to add them safely
      await sequelize.query(`
        ALTER TABLE \`student_internal_marks\`
          ADD COLUMN \`status\` ENUM('draft', 'submitted', 'verified', 'published', 'rejected') NOT NULL DEFAULT 'draft' AFTER \`remarks\`,
          ADD COLUMN \`submitted_by\` INT(11) NULL AFTER \`status\`,
          ADD COLUMN \`submitted_at\` DATETIME NULL AFTER \`submitted_by\`,
          ADD COLUMN \`verified_by\` INT(11) NULL AFTER \`submitted_at\`,
          ADD COLUMN \`verified_at\` DATETIME NULL AFTER \`verified_by\`,
          ADD COLUMN \`published_by\` INT(11) NULL AFTER \`verified_at\`,
          ADD COLUMN \`published_at\` DATETIME NULL AFTER \`published_by\`,
          ADD COLUMN \`rejection_reason\` TEXT NULL AFTER \`published_at\`,
          ADD COLUMN \`classId\` INT(11) NULL AFTER \`rejection_reason\`,
          ADD COLUMN \`internal100\` DECIMAL(5,2) DEFAULT 0.00 AFTER \`classId\`,
          ADD COLUMN \`assignment1\` DECIMAL(5,2) DEFAULT 0.00 AFTER \`internal100\`,
          ADD COLUMN \`assignment2\` DECIMAL(5,2) DEFAULT 0.00 AFTER \`assignment1\`,
          ADD COLUMN \`workingHours\` INT(11) DEFAULT 60 AFTER \`assignment2\`,
          ADD COLUMN \`presentHours\` INT(11) DEFAULT 0 AFTER \`workingHours\`,
          ADD COLUMN \`attendancePercentage\` DECIMAL(5,2) DEFAULT 0.00 AFTER \`presentHours\`,
          ADD KEY \`idx_status\` (\`status\`),
          ADD KEY \`idx_submitted_by\` (\`submitted_by\`);
      `);

      // Add constraints safely
      try {
        await sequelize.query(`
          ALTER TABLE \`student_internal_marks\`
            ADD CONSTRAINT \`fk_im_submitted_by\` FOREIGN KEY (\`submitted_by\`) REFERENCES \`faculty_profiles\` (\`faculty_id\`) ON DELETE RESTRICT,
            ADD CONSTRAINT \`fk_im_class\` FOREIGN KEY (\`classId\`) REFERENCES \`classes\` (\`id\`) ON DELETE RESTRICT;
        `);
        console.log('✅ Constraints added to student_internal_marks successfully.');
      } catch (err) {
        console.warn('⚠️ Warning adding constraints (they may already exist):', err.message);
      }
      
      console.log('✅ Columns added successfully.');
    } else {
      console.log('ℹ️ student_internal_marks table already has status column.');
    }

    // 4. Create exam_cell_submissions table
    console.log('\nStep 4: Checking and creating exam_cell_submissions table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`exam_cell_submissions\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`faculty_id\` INT(11) NOT NULL,
        \`subject_id\` INT(11) NOT NULL,
        \`class_id\` INT(11) NOT NULL,
        \`semester\` TINYINT(2) NOT NULL,
        \`academic_year\` VARCHAR(9) NOT NULL,
        \`batch\` VARCHAR(20) NOT NULL,
        \`internal_number\` INT(11) NOT NULL,
        \`status\` ENUM('submitted', 'under_review', 'published', 'rejected') NOT NULL DEFAULT 'submitted',
        \`total_students\` INT(11) DEFAULT 0,
        \`submitted_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`reviewed_by\` INT(11) NULL,
        \`reviewed_at\` DATETIME NULL,
        \`published_by\` INT(11) NULL,
        \`published_at\` DATETIME NULL,
        \`rejection_reason\` TEXT NULL,
        \`notes\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_submission\` (\`faculty_id\`, \`subject_id\`, \`class_id\`, \`semester\`, \`academic_year\`, \`internal_number\`),
        KEY \`idx_status\` (\`status\`),
        CONSTRAINT \`fk_ecs_faculty\` FOREIGN KEY (\`faculty_id\`) REFERENCES \`faculty_profiles\` (\`faculty_id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_ecs_subject\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_ecs_class\` FOREIGN KEY (\`class_id\`) REFERENCES \`classes\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_ecs_reviewer\` FOREIGN KEY (\`reviewed_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('✅ exam_cell_submissions table ready.');

    // 5. Create exam_cell_notifications table
    console.log('\nStep 5: Checking and creating exam_cell_notifications table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`exam_cell_notifications\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`submission_id\` INT(11) NULL,
        \`created_by\` INT(11) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`type\` ENUM('result_published', 'marks_submitted', 'marks_rejected', 'reminder') NOT NULL,
        \`target_role\` JSON NOT NULL,
        \`department_id\` INT(11) NULL,
        \`class_id\` INT(11) NULL,
        \`semester\` TINYINT(2) NULL,
        \`academic_year\` VARCHAR(9) NULL,
        \`is_sent\` TINYINT(1) NOT NULL DEFAULT 0,
        \`sent_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_ecn_submission\` FOREIGN KEY (\`submission_id\`) REFERENCES \`exam_cell_submissions\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_ecn_creator\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('✅ exam_cell_notifications table ready.');

    console.log('\n🎉 Exam Cell Admin Database Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

runMigration();
