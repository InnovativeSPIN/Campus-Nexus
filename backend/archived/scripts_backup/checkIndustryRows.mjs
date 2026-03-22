import { sequelize } from '../config/db.js';

(async ()=>{
  try {
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'faculty_industry_experience'");
    console.log('TABLE_EXISTS:', !!(tables && tables.length));

    const [cols] = await sequelize.query("SHOW COLUMNS FROM faculty_industry_experience");
    console.log('COLUMNS:', JSON.stringify(cols, null, 2));

    const [rows] = await sequelize.query('SELECT * FROM faculty_industry_experience WHERE faculty_id = ?', { replacements: [101] });
    console.log('ROWS_FOR_101:', JSON.stringify(rows, null, 2));
    await sequelize.close();
  } catch (err) {
    console.error('ERR', err);
    process.exit(1);
  }
})();
