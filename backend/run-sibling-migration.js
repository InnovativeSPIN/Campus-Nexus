import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const runMigration = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'eduvertex'
    });

    console.log('🔄 Running migration: Add siblings to student_bio table...\n');

    // Read and execute the migration SQL
    const sqlFile = path.join(process.cwd(), 'migrations', '099-add-siblings-to-student-bio.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executing: ${statement.substring(0, 60)}...`);
        await connection.query(statement);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigration();
