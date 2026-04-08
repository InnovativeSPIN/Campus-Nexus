import { sequelize } from './config/db.js';

const addColumn = async () => {
  try {
    console.log('\n🔧 Adding break_period_ids column to timetable_master table...\n');
    
    // Try to add the column
    await sequelize.query(`
      ALTER TABLE timetable_master 
      ADD COLUMN break_period_ids JSON DEFAULT JSON_ARRAY(3, 5, 8) 
      COMMENT 'Array of period_slot_ids that are configured as breaks for this timetable'
    `);
    
    console.log('✅ Column added successfully!\n');
    
    // Verify it was added
    const result = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'timetable_master' 
      AND COLUMN_NAME = 'break_period_ids'
    `);
    
    if (result[0].length > 0) {
      console.log('✅ Verification successful:');
      console.log(`   Column: ${result[0][0].COLUMN_NAME}`);
      console.log(`   Type: ${result[0][0].COLUMN_TYPE}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('⚠️  Column already exists (skipping): ', error.message, '\n');
      process.exit(0);
    }
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  }
};

addColumn();
