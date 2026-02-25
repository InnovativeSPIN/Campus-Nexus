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

    // Test 1: Full data (all fields)
    console.log('\n📝 Test 1: Sending full data with all fields...');
    const fullData = {
      degree: 'M.Tech',
      branch: 'Data Science',
      college: 'Test University',
      university: 'Anna University',
      year: '2020',
      percentage: '85',
      society_name: 'IEEE'
    };

    let response = await fetch('http://localhost:3005/api/v1/faculty/education', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fullData)
    });

    let data = await response.json();
    console.log(`Status: ${response.status}`);
    if (!response.ok) {
      console.log('❌ Error:', JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Success! Created record:', data.data.membership_id);
    }

    // Test 2: Minimal data (only required fields)
    console.log('\n📝 Test 2: Sending minimal data (only required fields)...');
    const minimalData = {
      degree: 'B.E',
      branch: 'Computer Science',
      university: 'Anna University'
    };

    response = await fetch('http://localhost:3005/api/v1/faculty/education', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalData)
    });

    data = await response.json();
    console.log(`Status: ${response.status}`);
    if (!response.ok) {
      console.log('❌ Error:', JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Success! Created record:', data.data.membership_id);
    }

    // Test 3: With empty college field (like frontend might send)
    console.log('\n📝 Test 3: Sending with empty college field...');
    const emptyCollegeData = {
      degree: 'Ph.D',
      branch: 'AI',
      college: '',
      university: 'MIT',
      year: '2022',
      percentage: '90',
      society_name: ''
    };

    response = await fetch('http://localhost:3005/api/v1/faculty/education', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emptyCollegeData)
    });

    data = await response.json();
    console.log(`Status: ${response.status}`);
    if (!response.ok) {
      console.log('❌ Error:', JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Success! Created record:', data.data.membership_id);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
