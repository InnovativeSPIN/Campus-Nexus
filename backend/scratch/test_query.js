// Simulates what the controller does for a faculty user in AI&DS dept
import { sequelize } from '../config/db.js';

async function test() {
  const dept = 'AI&DS';
  const role = 'faculty';

  try {
    // Test 1: getAnnouncements (student/faculty role-filtered view)
    const rows1 = await sequelize.query(
      `SELECT id, title, targetRole, department
       FROM announcements
       WHERE isActive = 1
         AND (targetRole LIKE '%"all"%' OR targetRole LIKE ?)
         AND (department IS NULL OR department = ?)
       ORDER BY createdAt DESC`,
      { type: sequelize.QueryTypes.SELECT, replacements: [`%"${role}"%`, dept] }
    );
    console.log(`\n📋 getAnnouncements for role="${role}", dept="${dept}":`);
    console.log(JSON.stringify(rows1, null, 2));

    // Test 2: getAdminAnnouncements (notice board view)
    const rows2 = await sequelize.query(
      `SELECT id, title, targetRole, department
       FROM announcements
       WHERE (department IS NULL OR department = ?)
       ORDER BY createdAt DESC`,
      { type: sequelize.QueryTypes.SELECT, replacements: [dept] }
    );
    console.log(`\n📋 getAdminAnnouncements for dept="${dept}":`);
    console.log(JSON.stringify(rows2, null, 2));

    // Test 3: student view
    const role2 = 'student';
    const rows3 = await sequelize.query(
      `SELECT id, title, targetRole, department
       FROM announcements
       WHERE isActive = 1
         AND (targetRole LIKE '%"all"%' OR targetRole LIKE ?)
         AND (department IS NULL OR department = ?)
       ORDER BY createdAt DESC`,
      { type: sequelize.QueryTypes.SELECT, replacements: [`%"${role2}"%`, dept] }
    );
    console.log(`\n📋 getAnnouncements for role="${role2}", dept="${dept}":`);
    console.log(JSON.stringify(rows3, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sequelize.close();
  }
}
test();
