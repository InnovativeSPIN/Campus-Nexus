import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { sequelize } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    console.log('Starting migration: Add lesson_plan_id to student_attendance...');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'add_lesson_plan_to_attendance.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}...`);
      await sequelize.query(statement);
    }

    console.log('✅ Migration completed successfully!');
    console.log('✓ Added lesson_plan_id field to student_attendance table');
    console.log('✓ Created foreign key constraint');
    console.log('✓ Created index idx_student_attendance_lesson_plan');

    process.exit(0);
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('✅ Migration skipped: Column already exists');
      process.exit(0);
    }
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
