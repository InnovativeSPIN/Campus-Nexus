#!/usr/bin/env node
/**
 * Run SQL Migration: Make subject.department_id nullable
 * This allows cross-departmental subjects (placement, library, sports)
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function runMigration() {
  let connection = null;
  try {
    console.log('🔄 Running Migration: Make subject.department_id nullable\n');

    // Create connection
    const connectionConfig = {
      host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
      user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASS || '',
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'eduvertex',
      port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
      multipleStatements: true,
    };

    console.log('🔗 Connection Config:');
    console.log(`   Host: ${connectionConfig.host}`);
    console.log(`   Port: ${connectionConfig.port}`);
    console.log(`   Database: ${connectionConfig.database}`);
    console.log(`   User: ${connectionConfig.user}\n`);

    const connection = await mysql.createConnection(connectionConfig);

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Read migration file
    const migrationFile = path.join(__dirname, 'migrations', '012_make_subject_department_nullable.sql');
    
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found: ${migrationFile}`);
    }
    
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    console.log('📄 Migration file loaded');
    console.log('\n📝 Executing SQL statements...\n');
    console.log('SQL to execute:');
    console.log(sql);
    console.log('\n');

    // Execute migration
    try {
      const [result] = await connection.query(sql);
      
      console.log('✅ Migration executed successfully');
      console.log('\n📊 Results:');
      console.log('   - department_id column now allows NULL');
      console.log('   - semester column now allows NULL');
      console.log('\n✨ Migration completed successfully!\n');
    } catch (queryError) {
      console.error('Query Error Details:');
      console.error('  Code:', queryError.code);
      console.error('  Message:', queryError.message);
      console.error('  SQL:', queryError.sql);
      throw queryError;
    }

  } catch (error) {
    console.error('\n❌ Migration Failed');
    console.error('\n=== ERROR DETAILS ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Errno:', error.errno);
    console.error('Path:', error.path);
    console.error('Full Error:', error);
    console.error('====================\n');
    
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      console.error('ℹ️  Column not found or syntax error');
    } else if (error.code === 'ER_PARSE_ERROR') {
      console.error('ℹ️  SQL syntax error');
    } else if (error.code === 'ENOENT') {
      console.error('ℹ️  File not found');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed\n');
    }
  }
}

// Run migration
runMigration();
