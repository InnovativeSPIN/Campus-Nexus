import { sequelize } from '../backend/config/db.js';

async function main() {
  const [rows] = await sequelize.query("SELECT id, subject_code, subject_name, batch FROM subjects ORDER BY id DESC LIMIT 20");
  console.table(rows);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
