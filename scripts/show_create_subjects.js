import { sequelize } from '../backend/config/db.js';

async function main() {
  const [results] = await sequelize.query("SHOW CREATE TABLE subjects");
  console.log(results[0]);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
