import { sequelize } from '../config/db.js';

(async () => {
  try {
    const [rows] = await sequelize.query("SHOW TABLES LIKE 'faculty_industry_experience'");
    console.log(rows);
    await sequelize.close();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
