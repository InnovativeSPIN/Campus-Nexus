import jwt from 'jsonwebtoken';
import { sequelize } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const testAuth = async () => {
  try {
    console.log('\n🧪 Testing Authentication Flow\n');
    console.log('='.repeat(70));

    // Step 1: Get first student from database
    console.log('\n📝 Step 1: Getting first student from database...');
    const students = await sequelize.query('SELECT id, studentId, firstName, lastName, email FROM student_profile LIMIT 1', { raw: true });
    
    if (!students[0] || students[0].length === 0) {
      console.log('❌ No students found in database');
      process.exit(1);
    }

    const student = students[0][0];
    console.log(`✅ Found student:`, {
      id: student.id,
      studentId: student.studentId,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email
    });

    // Step 2: Create JWT token
    console.log('\n🔐 Step 2: Creating JWT token...');
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log(`   JWT_SECRET: ${JWT_SECRET.substring(0, 20)}...`);
    
    const token = jwt.sign(
      { id: student.id, type: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log(`✅ Token created:`);
    console.log(`   ${token}`);

    // Step 3: Verify token
    console.log('\n✔️  Step 3: Verifying token...');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`✅ Token valid. Decoded:`, decoded);
    } catch (err) {
      console.log(`❌ Token invalid:`, err.message);
      process.exit(1);
    }

    // Step 4: Test endpoint with curl
    console.log('\n🌐 Step 4: Ready for REST API testing\n');
    console.log('Use this token to test:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3030/api/v1/students/me/profile`);
    
    console.log('\n='.repeat(70));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

testAuth();
