import { sequelize } from '../config/db.js';

const check = async () => {
  try {
    const [rows] = await sequelize.query("SELECT * FROM faculy_edu_qualification WHERE faculty_id = 101 LIMIT 5");
    console.log('rows:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Query error:', err.message || err);
    console.error(err);
    process.exit(1);
  }
};
check();
