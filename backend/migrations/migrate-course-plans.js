#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const executeMigration = async () => {
  let connection;
  try {
    console.log('\n🚀 Beginning Course Lesson Plan Migration...\n');

    // Create MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'eduvertex',
      enableKeepAlive: true,
      enableDeepStacks: true,
    });

    console.log(`✅ Connected to database: ${process.env.DB_NAME}\n`);

    // Read SQL file
    const sqlPath = path.join(process.cwd(), 'migrations', 'create_course_lesson_plans.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Parse SQL statements (split by semicolon, filter comments)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📋 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${stmt.substring(0, 60)}...`);
        await connection.query(stmt);
        console.log(`    ✅ Success\n`);
        successCount++;
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.message.includes('already exists')) {
          console.log(`    ⚠️  Skipped (already exists)\n`);
          skipCount++;
        } else {
          console.error(`    ❌ Error: ${err.message}\n`);
          throw err;
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Migration completed!`);
    console.log(`   ✓ Successfully executed: ${successCount}`);
    console.log(`   ⚠️  Skipped (existing): ${skipCount}`);
    console.log(`\n📊 Created entities:`);
    console.log(`   • Tables: course_lesson_plans, period_topic_log`);
    console.log(`   • Views: course_lesson_plan_progress, course_file_section_x`);
    console.log(`${'='.repeat(60)}\n`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Migration failed: ${error.message}\n`);
    console.error(error);
    if (connection) await connection.end();
    process.exit(1);
  }
};

executeMigration();
