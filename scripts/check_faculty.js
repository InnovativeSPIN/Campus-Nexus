import { sequelize } from '../backend/config/db.js';

async function main() {
  const [rows] = await sequelize.query("SELECT faculty_id FROM faculty_profiles WHERE faculty_id = 435");
  console.log(rows);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
