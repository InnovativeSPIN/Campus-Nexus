// Test endpoints with latest fixes
import { models } from './models/index.js';

const { Department, Faculty, Student } = models;

async function testDepartments() {
  try {
    console.log('🧪 Testing Department.findAll()...');
    const departments = await Department.findAll({
      order: [['short_name', 'ASC']],
      limit: 2
    });
    console.log(`✅ Got ${departments.length} departments\n`);
    
    if (departments.length > 0) {
      const dept = departments[0];
      const facultyCount = await Faculty.count({ where: { department_id: dept.id } });
      const studentCount = await Student.count({ where: { departmentId: dept.id } });
      console.log(`  Department: ${dept.short_name || dept.full_name}`);
      console.log(`  Faculty count: ${facultyCount}`);
      console.log(`  Student count: ${studentCount}\n`);
    }
  } catch (err) {
    console.error('❌ Department error:', err.message);
    console.error('SQL:', err.sql);
  }
}

async function testFaculty() {
  try {
    console.log('🧪 Testing Faculty.findAll() with order by created_at...');
    const faculty = await Faculty.findAll({
      include: [
        { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
      ],
      limit: 3,
      order: [['created_at', 'DESC']]
    });
    console.log(`✅ Got ${faculty.length} faculty records\n`);
  } catch (err) {
    console.error('❌ Faculty error:', err.message);
    console.error('SQL:', err.sql);
  }
}

(async () => {
  console.log('=== TESTING FIXED ENDPOINTS ===\n');
  await testDepartments();
  await testFaculty();
  console.log('✅ Tests complete');
  process.exit(0);
})();
