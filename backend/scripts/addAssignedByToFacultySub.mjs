import { sequelize } from '../config/db.js';

try {
  await sequelize.query("ALTER TABLE faculty_subject_assignments ADD COLUMN IF NOT EXISTS assigned_by INT(11) NULL AFTER subject_id;");
  console.log('ALTER executed');
  process.exit(0);
} catch (err) {
  console.error('ERR', err);
  process.exit(1);
}
