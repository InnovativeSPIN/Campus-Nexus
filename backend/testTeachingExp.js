import { sequelize } from './config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  try {
    // Get faculty and generate token
    const faculty = await sequelize.query(`
      SELECT f.faculty_id, f.faculty_college_code, f.Name, f.email, d.id as dept_id, d.full_name, d.short_name
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
    const token = jwt.sign(
      {
        id: user.faculty_id,
        type: 'faculty',
        facultyCode: user.faculty_college_code,
        name: user.Name,
        email: user.email,
        role: 'faculty',
        department: {
          id: user.dept_id,
          full_name: user.full_name,
          short_name: user.short_name
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Generated token for faculty_id 101');

    // Test teaching experience POST
    console.log('\n📝 Testing teaching experience POST...');
    const expData = {
      designation: 'Assistant Professor',
      institution_name: 'Nadar Saraswathi College of Engineering and Technology',
      university: 'Anna University',
      department: 'Computer Science Engineering',
      from_date: '2020-01-01',
      to_date: '2023-12-31',
      period: '3 years',
      is_current: false
    };

    console.log('Request body:', JSON.stringify(expData, null, 2));

    let response = await fetch('http://localhost:3005/api/v1/faculty/experience', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expData)
    });

    let data = await response.json();
    console.log(`Status: ${response.status}`);
    if (!response.ok) {
      console.log('❌ Error:', JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Success! Created record:', data.data.id);
    }

    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
