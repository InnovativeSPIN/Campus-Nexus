import { sequelize } from './config/db.js';

(async () => {
  try {
    console.log('Checking users table...');
    const users = await sequelize.query(`SELECT id, name, email FROM users LIMIT 3`);
    console.log('Users:', users[0]);
    
    console.log('\nChecking faculty_profiles table...');
    const faculty = await sequelize.query(`SELECT faculty_id, faculty_college_code, Name FROM faculty_profiles LIMIT 3`);
    console.log('Faculty:', faculty[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
