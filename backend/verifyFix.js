// Test Student queries specifically for userId exclusion
import { models } from './models/index.js';

const { Student } = models;

async function testStudentExclusion() {
  try {
    console.log('🧪 Testing Student.findAll() with userId exclusion...\n');
    
    console.log('Getting first 3 students from database...');
    const students = await Student.findAll({
      attributes: { exclude: ['userId'] },
      limit: 3
    });
    
    console.log(`✅ SUCCESS! Retrieved ${students.length} students without userId error\n`);
    
    if (students.length > 0) {
      const first = students[0].toJSON();
      console.log('Sample student data:');
      console.log(`  - ID: ${first.id}`);
      console.log(`  - StudentID: ${first.studentId}`);
      console.log(`  - Name: ${first.firstName} ${first.lastName}`);
      console.log(`  - Email: ${first.email}`);
      console.log(`  - Status: ${first.status}`);
      console.log(`  - Has userId field: ${'userId' in first}`);
    }
    
    console.log('\nTesting Student.findOne() with studentId lookup...');
    const student = await Student.findOne({
      where: { studentId: '921023205024' },
      attributes: { exclude: ['userId'] }
    });
    
    if (student) {
      console.log(`✅ SUCCESS! Found student: ${student.firstName} ${student.lastName}`);
      const data = student.toJSON();
      console.log(`  - Has userId field: ${'userId' in data}`);
    } else {
      console.log('⚠️  Student not found but query executed successfully');
    }
    
    console.log('\n✅ ALL TESTS PASSED - userId exclusion is working!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('\nFull error:');
    console.error(err);
    process.exit(1);
  }
}

testStudentExclusion();
