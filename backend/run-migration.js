import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/db.js';
import { up as upEmis } from './migrations/add_emis_no_to_student_profile.js';
import { up as upMultiLevel } from './migrations/add_multilevel_approval_to_leave.js';
import initModels from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('Starting migrations...');

    // Initialize all models (associations)
    initModels();

    // Migration 1: Add EMIS number to student profile
    console.log('\n📋 Running Migration 1: Add EMIS number to student profile...');
    try {
      await upEmis(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log('✓ Migration 1 completed successfully');
    } catch (error) {
      console.warn('⚠ Migration 1 warning:', error.message);
      // Continue to next migration even if this one fails
    }

    // Migration 2: Add multi-level approval fields to Leave table
    console.log('\n📋 Running Migration 2: Add multi-level approval to Leave...');
    try {
      await upMultiLevel(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log('✓ Migration 2 completed successfully');
    } catch (error) {
      console.error('✗ Migration 2 failed:', error.message);
      throw error;
    }

    // Migration 3: Create Course Lesson Plans tables
    console.log('\n📋 Running Migration 3: Create Course Lesson Plans tables...');
    try {
      const sqlPath = path.join(__dirname, 'migrations', 'create_course_lesson_plans.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Split statements by semicolon
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));
      
      console.log(`  Found ${statements.length} SQL statements to execute...`);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await sequelize.query(stmt + ';');
          console.log(`  ✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          // Check if error is about table already existing
          if (err.message && (err.message.includes('already exists') || err.message.includes('ER_TABLE_EXISTS_ERROR'))) {
            console.log(`  ℹ Statement ${i + 1}/${statements.length}: Entity already exists (skipped)`);
          } else {
            throw err;
          }
        }
      }
      
      console.log('✓ Migration 3 completed successfully');
      console.log('  Tables created: course_lesson_plans, period_topic_log');
      console.log('  Views created: course_lesson_plan_progress, course_file_section_x');
    } catch (error) {
      console.error('✗ Migration 3 failed:', error.message);
      throw error;
    }

    // Migration 4: Add approval status fields to course_lesson_plans
    console.log('\n📋 Running Migration 4: Add approval status fields to course_lesson_plans...');
    try {
      const sqlPath = path.join(__dirname, 'migrations', 'add-approval-fields-to-course-lesson-plans.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Split statements by semicolon
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));
      
      console.log(`  Found ${statements.length} SQL statements to execute...`);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await sequelize.query(stmt + ';');
          console.log(`  ✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          // Check if error is about column/index already existing
          if (err.message && (err.message.includes('already exists') || err.message.includes('ER_DUP_FIELDNAME') || err.message.includes('ER_DUP_KEYNAME'))) {
            console.log(`  ℹ Statement ${i + 1}/${statements.length}: Already exists (skipped)`);
          } else {
            throw err;
          }
        }
      }
      
      console.log('✓ Migration 4 completed successfully');
      console.log('  Columns added: approval_status, approval_remarks, approved_by, approved_date');
    } catch (error) {
      console.error('✗ Migration 4 failed:', error.message);
      throw error;
    }

    console.log('\n✅ All migrations completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration process failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

runMigrations();
