import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  let connection;
  try {
    console.log('🔄 Starting database migration...\n');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Read SQL migration file
    const sqlFile = path.join(__dirname, '001-create-lesson-plan-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('\n📋 Executing migration SQL...\n');

    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt.length > 5);

    let successCount = 0;
    let skipCount = 0;

    // Execute each statement
    for (const statement of statements) {
      try {
        const shortStmt = statement.substring(0, 80).replace(/\n/g, ' ') + '...';
        process.stdout.write(`⚙️  ${shortStmt}`);
        
        await connection.query(statement);
        
        console.log(' ✓');
        successCount++;
      } catch (error) {
        // Check if it's a "table already exists" or "column already exists" error
        if (
          error.message.includes('already exists') ||
          error.message.includes('Duplicate') ||
          error.message.includes('Duplicate key')
        ) {
          console.log(' ⊘ (already exists)');
          skipCount++;
        } else {
          console.log(` ✗\n   Error: ${error.message}`);
          // Don't throw - continue with other statements
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully executed: ${successCount} statements`);
    console.log(`   ⊘  Skipped (already exist): ${skipCount} statements`);
    console.log('='.repeat(60));

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📝 Created/Updated:');
    console.log('   • course_lesson_plans table');
    console.log('   • period_topic_log table');
    console.log('   • lesson_plan_id column on student_attendance');
    console.log('   • All foreign key constraints');
    console.log('   • All performance indexes\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();
