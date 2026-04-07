/**
 * Migration: Add 'break' to session_type ENUM in timetable_master_slots
 * This allows break periods to have session_type = 'break'
 */

import { sequelize } from './models/index.js';

const migration = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Alter the session_type column to add 'break' value
    const sql = `
      ALTER TABLE timetable_master_slots 
      MODIFY COLUMN session_type ENUM('theory', 'lab', 'tutorial', 'activity', 'project', 'free', 'break') 
      DEFAULT 'theory'
    `;

    console.log('Running migration: Adding "break" to session_type ENUM...');
    await sequelize.query(sql);
    console.log('✅ Migration successful! session_type ENUM updated');

    // Verify the change
    const [result] = await sequelize.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'timetable_master_slots' 
      AND COLUMN_NAME = 'session_type'
    `);

    if (result.length > 0) {
      console.log('✅ Column definition:', result[0].COLUMN_TYPE);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  }
};

migration();
