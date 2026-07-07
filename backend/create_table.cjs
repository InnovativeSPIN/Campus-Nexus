const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT
    });
    const query = `CREATE TABLE IF NOT EXISTS mentor_allocations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_id INT(11) NOT NULL,
      student_id INT(11) NOT NULL,
      academic_year VARCHAR(20) NOT NULL,
      assigned_by INT,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES student_profile(id) ON DELETE CASCADE,
      UNIQUE KEY unique_student_year (student_id, academic_year)
    );`;
    await conn.query(query);
    console.log('Success');
    conn.end();
  } catch(e) {
    console.error(e);
  }
}
run();
