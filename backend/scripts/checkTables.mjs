import { sequelize } from '../config/db.js';

const check = async () => {
  try {
    const [results] = await sequelize.query("SHOW TABLES LIKE 'faculy_edu_qualification'");
    console.log(results);
    const [results2] = await sequelize.query("SHOW TABLES LIKE 'faculty_experience'");
    console.log(results2);
    const [all] = await sequelize.query("SHOW TABLES");
    console.log('Total tables:', all.length);
    process.exit(0);
  } catch (err) {
    console.error('Query error:', err.message || err);
    process.exit(1);
  }
};
check();
