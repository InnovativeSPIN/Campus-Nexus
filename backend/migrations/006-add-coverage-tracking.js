import { sequelize } from '../config/db.js';

export async function applyMigration() {
  try {
    console.log('🔄 Applying migration: Add coverage tracking columns to course_lesson_plans...');

    const queries = [
      // Add coverage_status column
      `ALTER TABLE course_lesson_plans ADD COLUMN IF NOT EXISTS coverage_status 
       ENUM('completed', 'deviation') DEFAULT NULL 
       COMMENT 'Status of topic coverage (completed or deviation)'`,

      // Add coverage_date column
      `ALTER TABLE course_lesson_plans ADD COLUMN IF NOT EXISTS coverage_date 
       DATETIME DEFAULT NULL 
       COMMENT 'Date when the topic coverage was recorded'`,

      // Add completed_date column
      `ALTER TABLE course_lesson_plans ADD COLUMN IF NOT EXISTS completed_date 
       DATETIME DEFAULT NULL 
       COMMENT 'Date when the topic was marked as completed'`,

      // Add deviation_reason column
      `ALTER TABLE course_lesson_plans ADD COLUMN IF NOT EXISTS deviation_reason 
       LONGTEXT DEFAULT NULL 
       COMMENT 'Reason for deviation if status is deviation'`,

      // Add additional_notes column
      `ALTER TABLE course_lesson_plans ADD COLUMN IF NOT EXISTS additional_notes 
       LONGTEXT DEFAULT NULL 
       COMMENT 'Additional notes about the topic coverage'`,
    ];

    // Execute queries
    for (const query of queries) {
      await sequelize.query(query);
      console.log('✅ Executed:', query.split('\n')[0]);
    }

    console.log('✅ Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  applyMigration()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
