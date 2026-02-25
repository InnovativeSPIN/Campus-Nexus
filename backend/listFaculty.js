import { sequelize } from './config/db.js';

(async () => {
  try {
    // Find all faculty
    const result = await sequelize.query(`
      SELECT u.id, f.faculty_id, f.faculty_college_code, u.name, u.email, f.designation
      FROM faculty_profiles f
      JOIN users u ON f.faculty_id = u.id
      LIMIT 5
    `);

    console.log('Available Faculty:');
    result[0].forEach(f => {
      console.log(`  - ID: ${f.id}, Code: ${f.faculty_college_code}, Name: ${f.name}, Email: ${f.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
