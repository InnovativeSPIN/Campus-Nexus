import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function verifyDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eduvertex',
  });

  try {
    const [leaves] = await conn.query('SELECT COUNT(*) as count FROM leaves');
    const [balance] = await conn.query('SELECT COUNT(*) as count FROM leave_balance');
    console.log('✓ Leaves table data:', leaves[0].count, 'records');
    console.log('✓ Leave balance table data:', balance[0].count, 'records');
    
    const [leaveDetails] = await conn.query('SELECT id, applicantId, leaveType, status, totalDays FROM leaves LIMIT 3');
    console.log('\n✓ Sample leaves:');
    leaveDetails.forEach(l => console.log(`  - Leave #${l.id}: ${l.leaveType} (${l.totalDays} days) - Status: ${l.status}`));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await conn.end();
  }
}

verifyDatabase();
