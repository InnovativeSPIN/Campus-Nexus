import { sequelize } from './config/db.js';

(async () => {
  try {
    // Check the structure of faculty_profiles
    const structure = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'faculty_profiles' AND TABLE_SCHEMA = 'eduvertex'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('faculty_profiles columns:');
    structure[0].forEach(c => {
      console.log(`  - ${c.COLUMN_NAME}: ${c.COLUMN_TYPE}`);
    });
    
    // Get faculty with their user relationship
    const faculty = await sequelize.query(`
      SELECT * FROM faculty_profiles LIMIT 1
    `);
    
    console.log('\nSample faculty_profiles record:');
    console.log(JSON.stringify(faculty[0][0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
