// Direct database test to verify Student queries work
import db from './config/db.js';
import { models } from './models/index.js';

const { Student, Department, ClassModel } = models;

async function testStudentQueries() {
  try {
    console.log('=== TESTING STUDENT QUERIES ===\n');
    
    console.log('1️⃣  Testing Student.findAll() (getAllStudents)...');
    try {
      const students = await Student.findAll({
        attributes: { exclude: ['userId'] },
        include: [
          { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
          { model: ClassModel, as: 'class', attributes: ['name', 'section'] }
        ],
        limit: 5
      });
      console.log(`   ✅ SUCCESS - Found ${students.length} students\n`);
    } catch (err) {
      console.log(`   ❌ ERROR - ${err.message}\n`);
    }
    
    console.log('2️⃣  Testing Student.findByPk()...');
    try {
      const student = await Student.findByPk(1, {
        attributes: { exclude: ['userId'] },
        include: [
          { model: Department, as: 'department', attributes: ['short_name', 'full_name'] },
          { model: ClassModel, as: 'class', attributes: ['name', 'section'] }
        ]
      });
      console.log(`   ✅ SUCCESS - ${student ? 'Found' : 'No'} student with id 1\n`);
    } catch (err) {
      console.log(`   ❌ ERROR - ${err.message}\n`);
    }
    
    console.log('3️⃣  Testing Student.findOne() with studentId...');
    try {
      const student = await Student.findOne({
        where: { studentId: '921023205024' },
        attributes: { exclude: ['userId'] },
        include: [
          { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
        ]
      });
      console.log(`   ✅ SUCCESS - ${student ? 'Found' : 'No'} student with studentId 921023205024\n`);
    } catch (err) {
      console.log(`   ❌ ERROR - ${err.message}\n`);
    }
    
    console.log('4️⃣  Testing Student.findAll() with aggregation...');
    try {
      const stats = await Student.findAll({
        where: { status: 'active' },
        attributes: { exclude: ['userId'] },
        group: ['departmentId'],
        limit: 3
      });
      console.log(`   ✅ SUCCESS - Found ${stats.length} department groups\n`);
    } catch (err) {
      console.log(`   ❌ ERROR - ${err.message}\n`);
    }
    
    console.log('=== ALL TESTS COMPLETE ===');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

testStudentQueries();
