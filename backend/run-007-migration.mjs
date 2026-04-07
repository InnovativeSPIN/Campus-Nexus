/**
 * Runner: migrations/007-ensure-course-plan-columns.sql
 * Adds missing columns (approval_status, upload_batch_id, batch_submission_date,
 * coverage_status, coverage_date, completed_date, deviation_reason, additional_notes, updated_by)
 * to the course_lesson_plans table.  Safe to run multiple times (IF NOT EXISTS).
 */
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const conn = await createConnection({
    host:     process.env.MYSQL_HOST     || '127.0.0.1',
    port:     parseInt(process.env.MYSQL_PORT || '3306', 10),
    database: process.env.MYSQL_DATABASE || 'eduvertex',
    user:     process.env.MYSQL_USER     || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('✅ Connected to DB:', process.env.MYSQL_DATABASE, 'on', process.env.MYSQL_HOST);

  const sqlFile = join(__dirname, 'migrations', '007-ensure-course-plan-columns.sql');
  const sql = readFileSync(sqlFile, 'utf-8');

  // Split on semicolons and run each statement individually so errors are pinpointed
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));

  let passed = 0;
  let failed = 0;
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
      console.log('  ✔', stmt.split('\n')[0].slice(0, 80));
      passed++;
    } catch (err) {
      // Duplicate index errors are harmless – MySQL 8.0 supports IF NOT EXISTS but
      // some MariaDB versions may emit a warning/error for existing indexes.
      if (err.code === 'ER_DUP_KEYNAME' || err.message.includes('Duplicate key name')) {
        console.warn('  ⚠ (ignored – index already exists):', stmt.split('\n')[0].slice(0, 80));
      } else {
        console.error('  ✗ FAILED:', err.message, '\n    SQL:', stmt.slice(0, 120));
        failed++;
      }
    }
  }

  // Run the SELECT confirmation separately
  const [rows] = await conn.query(`SELECT 'Migration 007 completed successfully' AS status`);
  console.log('\n', rows[0]);
  console.log(`\nSummary: ${passed} statements OK, ${failed} failed`);

  await conn.end();

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Migration runner error:', err.message);
  process.exit(1);
});
