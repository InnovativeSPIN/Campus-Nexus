import { sequelize } from './config/db.js';
import jwt from 'jsonwebtoken';

(async () => {
  try {
    // Get faculty 
    const faculty = await sequelize.query(`
      SELECT f.faculty_id, f.faculty_college_code, f.Name, f.email, f.designation, d.id as dept_id, d.full_name, d.short_name
      FROM faculty_profiles f
      LEFT JOIN departments d ON f.department_id = d.id
      WHERE f.faculty_id = 101
      LIMIT 1
    `);

    if (faculty[0].length === 0) {
      console.error('Faculty not found');
      process.exit(1);
    }

    const user = faculty[0][0];
    console.log('Found Faculty:', user.Name, user.email);

    // Generate new token valid for 1 hour
    const token = jwt.sign(
      {
        id: user.faculty_id,
        type: 'department-admin',
        facultyCode: user.faculty_college_code,
        name: user.Name,
        email: user.email,
        role: 'department-admin',
        department: {
          id: user.dept_id,
          full_name: user.full_name,
          short_name: user.short_name
        }
      },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production',
      { expiresIn: '1h' }
    );

    console.log('\n✅ New Valid Token Generated:');
    console.log(token);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
