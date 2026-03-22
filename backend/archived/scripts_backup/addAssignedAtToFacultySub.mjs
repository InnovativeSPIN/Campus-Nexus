import { sequelize } from '../config/db.js';

try {
  await sequelize.query("ALTER TABLE faculty_subject_assignments ADD COLUMN IF NOT EXISTS assigned_at DATETIME NULL AFTER assigned_by;" );
  await sequelize.query("UPDATE faculty_subject_assignments SET assigned_at = allocation_date WHERE assigned_at IS NULL AND allocation_date IS NOT NULL;");
  console.log('ALTER and UPDATE executed');
  process.exit(0);
} catch (err) {
  console.error('ERR', err);
  process.exit(1);
}
