import { sequelize } from './config/db.js';

const testTables = async () => {
  try {
    // List all tables in the database
    const tables = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'eduvertex'", { raw: true });
    
    console.log('\n📊 Tables in eduvertex database:\n');
    console.log(tables[0].map(t => t.TABLE_NAME).sort());
    
    // Check specifically for student_profile
    const studentTableCheck = tables[0].find(t => t.TABLE_NAME === 'student_profile');
    if (studentTableCheck) {
      console.log('\n✅ student_profile table EXISTS');
      
      // Check number of students
      const studentCount = await sequelize.query('SELECT COUNT(*) as count FROM student_profile', { raw: true });
      console.log(`   Students in database: ${studentCount[0][0].count}`);
    } else {
      console.log('\n❌ student_profile table DOES NOT EXIST');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

testTables();
