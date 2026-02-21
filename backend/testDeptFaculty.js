// Test departments and faculty endpoints
import { models } from './models/index.js';

const { Department, Faculty, User, Student } = models;

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
      console.log('Testing User.findOne() with departmentCode...');
      const hod = await User.findOne({
        where: {
          role: 'department-admin',
          departmentCode: dept.short_name || dept.full_name
        },
        attributes: ['name', 'email']
      });
      console.log(`✅ User query result: ${hod ? hod.name : 'No HOD found'}\n`);
    }
  } catch (err) {
    console.error('❌ Department error:', err.message);
    console.error('SQL:', err.sql);
  }
}

async function testFaculty() {
  try {
    console.log('🧪 Testing Faculty.findAll()...');
    const faculty = await Faculty.findAll({
      limit: 3,
      order: [['createdAt', 'DESC']]
    });
    console.log(`✅ Got ${faculty.length} faculty records\n`);
    
    console.log('Testing Faculty with Department include...');
    const facultyWithDept = await Faculty.findAll({
      include: [
        { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
      ],
      limit: 2
    });
    console.log(`✅ Got ${facultyWithDept.length} faculty with departments\n`);
  } catch (err) {
    console.error('❌ Faculty error:', err.message);
    console.error('SQL:', err.sql);
  }
}

(async () => {
  console.log('=== TESTING DEPARTMENT & FACULTY ENDPOINTS ===\n');
  await testDepartments();
  await testFaculty();
  console.log('\n✅ Tests complete');
  process.exit(0);
})();
