import { sequelize } from '../backend/config/db.js';

async function main() {
  const [results] = await sequelize.query(
    "SELECT constraint_name, referenced_table_name, referenced_column_name FROM information_schema.key_column_usage " +
    "WHERE table_schema=DATABASE() AND table_name='faculty_subject_assignments' AND column_name='faculty_id'"
  );
  console.log(results);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
