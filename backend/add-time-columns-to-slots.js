import { sequelize } from './config/db.js';

async function addTimeColumnsToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database: ' + process.env.MYSQL_DATABASE);

    // Check if columns already exist
    const result = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'timetable_master_slots' 
      AND TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}'
    `);

    const columnNames = result[0].map(col => col.COLUMN_NAME);
    console.log('\n📋 Current columns in timetable_master_slots:');
    columnNames.forEach(col => console.log(`  - ${col}`));

    let changesNeeded = [];

    // Check if start_time exists
    if (!columnNames.includes('start_time')) {
      console.log('\n➕ Adding start_time column...');
      await sequelize.query(`
        ALTER TABLE timetable_master_slots 
        ADD COLUMN start_time TIME DEFAULT NULL 
        COMMENT 'Start time for this slot (HH:MM:SS format)'
        AFTER notes
      `);
      changesNeeded.push('start_time');
      console.log('✅ start_time column added');
    }

    // Check if end_time exists
    if (!columnNames.includes('end_time')) {
      console.log('\n➕ Adding end_time column...');
      await sequelize.query(`
        ALTER TABLE timetable_master_slots 
        ADD COLUMN end_time TIME DEFAULT NULL 
        COMMENT 'End time for this slot (HH:MM:SS format)'
        AFTER start_time
      `);
      changesNeeded.push('end_time');
      console.log('✅ end_time column added');
    }

    if (changesNeeded.length === 0) {
      console.log('\n✅ All time columns already exist in the database');
    } else {
      console.log(`\n✅ Successfully added ${changesNeeded.length} column(s): ${changesNeeded.join(', ')}`);
    }

    // Verify final structure
    console.log('\n📊 Updated table structure:');
    const finalResult = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'timetable_master_slots' 
      AND TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}'
      ORDER BY ORDINAL_POSITION
    `);

    finalResult[0].forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n✅ Database migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Database Error:', error.original.sqlMessage);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addTimeColumnsToDatabase();
