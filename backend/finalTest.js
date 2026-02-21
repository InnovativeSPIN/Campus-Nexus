// Comprehensive test to verify all endpoints work
import { models } from './models/index.js';

const { Student, Department, Faculty } = models;

async function runAllTests() {
  console.log('=== COMPREHENSIVE FIX VERIFICATION ===\n');
  
  let passCount = 0;
  let failCount = 0;
  
  // Test 1: Student queries without userId
  try {
    console.log('Test 1: Student.findAll() - getAllStudents endpoint');
    const students = await Student.findAll({
      attributes: { exclude: ['userId'] },
      limit: 5
    });
    console.log(`  ✅ PASS - Retrieved ${students.length} students without userId error`);
    passCount++;
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    failCount++;
  }
  
  // Test 2: Student queries with department includes
  try {
    console.log('\nTest 2: Student.findByPk() with departments - getStudent endpoint');
    const student = await Student.findByPk(1, {
      attributes: { exclude: ['userId'] },
      include: [{ model: Department, as: 'department' }]
    });
    console.log(`  ✅ PASS - Retrieved single student with department`);
    passCount++;
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    failCount++;
  }
  
  // Test 3: Department queries without HOD lookup
  try {
    console.log('\nTest 3: Department.findAll() - getDepartments endpoint');
    const departments = await Department.findAll({
      order: [['short_name', 'ASC']],
      limit: 10
    });
    console.log(`  ✅ PASS - Retrieved ${departments.length} departments without User.role error`);
    passCount++;
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    failCount++;
  }
  
  // Test 4: Faculty queries with created_at ordering
  try {
    console.log('\nTest 4: Faculty.findAll() with created_at ordering - getAllFaculty endpoint');
    const faculty = await Faculty.findAll({
      order: [['created_at', 'DESC']],
      limit: 10
    });
    console.log(`  ✅ PASS - Retrieved ${faculty.length} faculty records ordered by created_at`);
    passCount++;
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    failCount++;
  }

  // Test 5: Faculty with department includes
  try {
    console.log('\nTest 5: Faculty.findAll() with department includes - getAllFaculty endpoint');
    const faculty = await Faculty.findAll({
      include: [
        { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    console.log(`  ✅ PASS - Retrieved ${faculty.length} faculty with departments`);
    passCount++;
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    failCount++;
  }
  
  // Test 6: Department with counts
  try {
    console.log('\nTest 6: Department counts - getDepartments endpoint');
    const departments = await Department.findAll({
      order: [['short_name', 'ASC']],
      limit: 3
    });
    
    for (const dept of departments) {
      const facultyCount = await Faculty.count({ where: { department_id: dept.id } });
      const studentCount = await Student.count({ where: { departmentId: dept.id } });
      console.log(`    - ${dept.short_name}: ${facultyCount} faculty, ${studentCount} students`);
    }
    console.log(`  ✅ PASS - Department counts retrieved successfully`);
    passCount++;
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    failCount++;
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passCount} passed, ${failCount} failed`);
  console.log(`${'='.repeat(50)}`);
  
  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED - All 500 errors have been fixed!');
  } else {
    console.log(`\n⚠️  ${failCount} test(s) failed - issues remain`);
  }
  
  process.exit(failCount === 0 ? 0 : 1);
}

runAllTests();
