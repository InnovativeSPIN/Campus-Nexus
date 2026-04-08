import { sequelize } from './config/db.js';

const verifyColumn = async () => {
  try {
    console.log('\n📋 Checking timetable_master table structure...\n');
    
    // Get table description
    const result = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'timetable_master' AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);
    
    const columns = result[0];
    console.log(`Found ${columns.length} columns:\n`);
    
    columns.forEach(col => {
      const nullable = col.IS_NULLABLE === 'YES' ? '✓ NULL' : '✗ NOT NULL';
      const hasDefault = col.COLUMN_DEFAULT ? `(default: ${col.COLUMN_DEFAULT})` : '';
      console.log(`📌 ${col.COLUMN_NAME.padEnd(25)} | ${col.COLUMN_TYPE.padEnd(20)} | ${nullable} ${hasDefault}`);
    });
    
    // Check if break_period_ids exists
    const breakColumn = columns.find(c => c.COLUMN_NAME === 'break_period_ids');
    console.log(`\n${breakColumn ? '✅ break_period_ids column EXISTS' : '❌ break_period_ids column NOT FOUND'}\n`);
    
    // Try a simple query
    console.log('🔍 Testing simple SELECT query...\n');
    const testQuery = await sequelize.query(`SELECT id, break_period_ids FROM timetable_master LIMIT 1`);
    console.log('✅ Query successful:', testQuery[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  }
};

verifyColumn();
