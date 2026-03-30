import { sequelize } from '../config/db.js';

(async () => {
  try {
    console.log('Starting migration: faculty_experience -> faculty_industry_experience');

    // 1. Select rows that have industry fields populated
    const [rows] = await sequelize.query(`SELECT exp_id, faculty_id, job_title, company, location, from_date, to_date, period, is_current FROM faculty_experience WHERE (job_title IS NOT NULL AND job_title != '') OR (company IS NOT NULL AND company != '') OR (location IS NOT NULL AND location != '')`);

    console.log('Found', rows.length, 'rows with industry data');

    for (const r of rows) {
      const insertSql = `INSERT INTO faculty_industry_experience (faculty_id, job_title, company, location, from_date, to_date, period, is_current, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`;
      await sequelize.query(insertSql, { replacements: [r.faculty_id, r.job_title, r.company, r.location, r.from_date, r.to_date, r.period, r.is_current ? 1 : 0] });

      // set industry fields to NULL in old table
      await sequelize.query('UPDATE faculty_experience SET job_title = NULL, company = NULL, location = NULL WHERE exp_id = ?', { replacements: [r.exp_id] });
    }

    // 2. Drop the old columns (job_title, company, location) from faculty_experience
    // Check if columns exist then drop
    const [cols] = await sequelize.query("SHOW COLUMNS FROM faculty_experience LIKE 'job_title'");
    if (cols && cols.length) {
      console.log('Dropping columns job_title, company, location from faculty_experience');
      await sequelize.query('ALTER TABLE faculty_experience DROP COLUMN job_title, DROP COLUMN company, DROP COLUMN location');
    } else {
      console.log('Industry columns not present on faculty_experience; nothing to drop');
    }

    console.log('Migration completed successfully');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    console.error(err);
    await sequelize.close();
    process.exit(1);
  }
})();
