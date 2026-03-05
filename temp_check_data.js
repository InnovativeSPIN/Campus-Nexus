
const { sequelize } = require('./backend/config/db.js');
async function run() {
  try {
    const [r] = await sequelize.query('UPDATE student_profile SET classId=0 WHERE departmentId=6 AND semester=5');
    console.log('Updated students:', r.affectedRows);
    
    // Also check for any existing attendance for these students to understand why it might be empty
    const [students] = await sequelize.query('SELECT studentId FROM student_profile WHERE classId=0');
    if (students.length > 0) {
        const ids = students.map(s => \"'\" + s.studentId + \"'\").join(\",\");
        const [att] = await sequelize.query(\"SELECT count(*) as count FROM student_attendance_entry WHERE student_id IN (\" + ids + \")\");
        console.log('Attendance records for these students:', att[0].count);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
