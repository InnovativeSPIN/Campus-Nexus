import { sequelize } from '../config/db.js';

async function migrationUp() {
  try {
    // Add batch_id columns
    await sequelize.query(`
      ALTER TABLE course_lesson_plans
      ADD COLUMN IF NOT EXISTS upload_batch_id VARCHAR(50) NULL COMMENT 'Unique ID for batch upload (groups related topics)' AFTER faculty_id,
      ADD COLUMN IF NOT EXISTS batch_submission_date DATETIME NULL COMMENT 'When this batch was submitted for approval' AFTER approved_date
    `);

    // Add indices
    await sequelize.query(`
      ALTER TABLE course_lesson_plans
      ADD INDEX IF NOT EXISTS idx_batch_id (upload_batch_id),
      ADD INDEX IF NOT EXISTS idx_batch_submission (batch_submission_date)
    `);

    // For existing records, create batch IDs based on (faculty_id, subject_id, class_id, created_at minute)
    await sequelize.query(`
      UPDATE course_lesson_plans
      SET upload_batch_id = CONCAT(
        faculty_id, '_',
        subject_id, '_',
        class_id, '_',
        DATE_FORMAT(created_at, '%Y%m%d%H%i')
      )
      WHERE upload_batch_id IS NULL
    `);

    console.log('✅ Migration 005: Added batch_id and batch_submission_date to course_lesson_plans');
  } catch (error) {
    console.error('❌ Migration 005 failed:', error.message);
    throw error;
  }
}

export { migrationUp };
