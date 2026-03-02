import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'eduvertex',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  });

  try {
    const migrationFile = path.join(__dirname, 'migrations', '011_update_faculty_events_table.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    
    // Split and execute each statement separately
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        console.log(`Executing: ${trimmed.substring(0, 60)}...`);
        await connection.execute(trimmed);
      }
    }
    
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
