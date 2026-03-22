#!/usr/bin/env node
/**
 * Complete setup script:
 * 1. Test model loading 
 * 2. Run database migration
 * 3. Verify tables created
 */

import { sequelize } from './config/db.js';
import initModels, { models } from './models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n📋 CAMPUS NEXUS - Database Setup & Migration\n');
console.log('='.repeat(70));

async function main() {
  try {
    // STEP 1: Test Model Loading
    console.log('\n🔍 STEP 1: Testing Model Loading...');
    console.log('-'.repeat(70));
    
    const { sequelize: seq } = initModels();
    console.log('✅ Models imported and initialized');
    
    const criticalModels = ['CourseLessonPlan', 'PeriodTopicLog', 'StudentAttendance', 'Faculty', 'Subject', 'Class'];
    let modelCheckPass = true;
    
    for (const modelName of criticalModels) {
      if (models[modelName]) {
        console.log(`   ✓ ${modelName.padEnd(25)} loaded`);
      } else {
        console.log(`   ✗ ${modelName.padEnd(25)} NOT FOUND`);
        modelCheckPass = false;
      }
    }
    
    if (modelCheckPass) {
      console.log('\n✅ All critical models loaded successfully');
    } else {
      console.log('\n❌ Some models are missing');
      process.exit(1);
    }
    
    // STEP 2: Test Database Connection
    console.log('\n🔌 STEP 2: Testing Database Connection...');
    console.log('-'.repeat(70));
    
    try {
      await sequelize.authenticate();
      console.log('✅ Connected to database:', process.env.DB_NAME || 'eduvertex');
    } catch (authErr) {
      console.error('❌ Database connection failed:', authErr.message);
      process.exit(1);
    }
    
    // STEP 3: Run Migration
    console.log('\n📊 STEP 3: Running Database Migration...');
    console.log('-'.repeat(70));
    
    const migrationDir = path.join(__dirname, 'migrations');
    const sqlFiles = fs
      .readdirSync(migrationDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort to run migrations in order (001, 003, etc.)
    
    let success = 0;
    let skipped = 0;
    
    for (const sqlFileName of sqlFiles) {
      const sqlFile = path.join(migrationDir, sqlFileName);
      console.log(`\n📄 Running: ${sqlFileName}`);
      const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
      
      // Better SQL parsing: split by semicolon but keep multi-line statements intact
      const rawStatements = sqlContent.split(/;\s*(?=CREATE|ALTER|INSERT|UPDATE|DELETE|DROP|--)/i);
      
      const statements = rawStatements
        .map(stmt => stmt.trim())
        .filter(stmt => {
          // Remove comments and empty lines
          const cleaned = stmt
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            .trim();
          return cleaned.length > 10; // Keep meaningful SQL only
        });
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        const preview = stmt.substring(0, 50).replace(/\n/g, ' ').padEnd(50);
        
        try {
          process.stdout.write(`   [${String(i + 1).padStart(2)}/${statements.length}] ${preview}`);
          await sequelize.query(stmt);
          console.log(' ✓');
          success++;
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
            console.log(' ⊘');
            skipped++;
          } else {
            console.log(' ✗');
            console.error(`       Error: ${error.message.substring(0, 60)}`);
          }
        }
      }
    }
    
    // STEP 4: Verify Tables
    console.log('\n✅ STEP 4: Verifying Created Tables...');
    console.log('-'.repeat(70));
    
    try {
      const tables = await sequelize.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME IN ('course_lesson_plans', 'period_topic_log', 'student_attendance', 'course_files', 'course_file_notifications')
      `);
      
      const tableNames = tables[0].map(t => t.TABLE_NAME);
      
      console.log('\n   Table Status:');
      ['course_lesson_plans', 'period_topic_log', 'student_attendance', 'course_files', 'course_file_notifications'].forEach(table => {
        if (tableNames.includes(table)) {
          console.log(`   ✓ ${table.padEnd(30)} exists`);
        } else {
          console.log(`   ✗ ${table.padEnd(30)} missing`);
        }
      });
    } catch (error) {
      console.error('   Could not verify tables:', error.message);
    }
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY:');
    console.log('='.repeat(70));
    console.log(`   ✅ Models loaded: ${Object.keys(models).length}`);
    console.log(`   ✅ SQL statements executed: ${success}`);
    console.log(`   ⊘  SQL statements skipped: ${skipped}`);
    console.log(`   ✅ Database: ${process.env.DB_NAME}`);
    console.log('\n✅ SETUP COMPLETED SUCCESSFULLY\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

main();
