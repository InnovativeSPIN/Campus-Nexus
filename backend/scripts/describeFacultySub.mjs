import { sequelize } from '../config/db.js';

try {
  const [results] = await sequelize.query("SHOW COLUMNS FROM faculty_subject_assignments");
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
} catch (err) {
  console.error('ERR', err);
  process.exit(1);
}
