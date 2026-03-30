import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

try {
  await conn.execute("ALTER TABLE class_incharges ADD COLUMN status ENUM('active','inactive') NOT NULL DEFAULT 'active'");
  console.log('SUCCESS: Added status column to class_incharges');
  await conn.execute("UPDATE class_incharges SET status='active'");
  console.log('SUCCESS: Set all existing rows to active');
} catch(e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('INFO: status column already exists, no change needed');
  } else {
    console.error('ERROR:', e.message);
  }
} finally {
  await conn.end();
}
