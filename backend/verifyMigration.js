import mysql from 'mysql2/promise';

async function verifyMigration() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'eduvertex',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  });

  try {
    const [columns] = await connection.execute(
      'DESCRIBE faculty_events'
    );
    
    console.log('\n📊 Faculty Events Table Structure:');
    console.log('================================');
    columns.forEach(col => {
      console.log(`✓ ${col.Field.padEnd(20)} - ${col.Type}`);
    });
    
    console.log('\n✅ Migration verification successful!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

verifyMigration();
