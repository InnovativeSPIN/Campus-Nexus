
const { sequelize } = require('./backend/config/db.js');
async function run() {
  try {
    // Find a valid user ID for assigned_by
    const [users] = await sequelize.query('SELECT id FROM users LIMIT 1');
    const userId = users[0] ? users[0].id : null;
    console.log('Using User ID for assignment:', userId);

    // 1. Ensure students are in class 0
    const [r] = await sequelize.query('UPDATE student_profile SET classId=0 WHERE departmentId=6 AND semester=5');
    console.log('Updated students in class 0:', r.affectedRows);
    
    // 2. Ensure Nagajothi P is the incharge
    const [f] = await sequelize.query('SELECT faculty_id FROM faculty_profiles WHERE faculty_college_code=\"NS80T01\"');
    if (f.length > 0) {
        const fid = f[0].faculty_id;
        // Upsert incharge
        await sequelize.query(`INSERT INTO class_incharges (class_id, faculty_id, academic_year, assigned_by, status, created_at, updated_at) 
                               VALUES (0, ${fid}, '2024-25', ${userId}, 'active', NOW(), NOW())
                               ON DUPLICATE KEY UPDATE faculty_id=${fid}, status='active', updated_at=NOW()`);
        console.log('Class incharge set to Nagajothi P');
    }

    // 3. Enable Timetable Incharge for the faculty
    await sequelize.query('UPDATE faculty_profiles SET is_timetable_incharge=1 WHERE faculty_college_code=\"NS80T01\"');
    console.log('Timetable Incharge enabled for NS80T01');

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
