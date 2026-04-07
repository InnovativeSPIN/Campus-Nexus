import { sequelize } from './config/db.js';

async function addSubjectColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database: ' + process.env.MYSQL_DATABASE);

    // Check if columns already exist
    const result = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'subjects' 
      AND TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}'
    `);

    const columnNames = result[0].map(col => col.COLUMN_NAME);
    console.log('\n📋 Current columns in subjects table:');
    columnNames.forEach(col => console.log(`  - ${col}`));

    let changesNeeded = [];

    // Check if subject_category exists
    if (!columnNames.includes('subject_category')) {
      console.log('\n➕ Adding subject_category column...');
      await sequelize.query(`
        ALTER TABLE subjects 
        ADD COLUMN subject_category ENUM('academic','library','sports','placement') 
        DEFAULT 'academic' 
        COMMENT 'Category of subject'
        AFTER lab_hours_per_week
      `);
      changesNeeded.push('subject_category');
      console.log('✅ subject_category column added');
    }

    // Check if available_to_all_departments exists
    if (!columnNames.includes('available_to_all_departments')) {
      console.log('\n➕ Adding available_to_all_departments column...');
      await sequelize.query(`
        ALTER TABLE subjects 
        ADD COLUMN available_to_all_departments TINYINT(1) 
        DEFAULT 0 
        COMMENT 'If true, subject is available to all departments'
        AFTER subject_category
      `);
      changesNeeded.push('available_to_all_departments');
      console.log('✅ available_to_all_departments column added');
    }

    if (changesNeeded.length === 0) {
      console.log('\n✅ All subject columns already exist in the database');
    } else {
      console.log(`\n✅ Successfully added ${changesNeeded.length} column(s): ${changesNeeded.join(', ')}`);
    }

    // Verify final structure
    console.log('\n📊 Updated table structure:');
    const finalResult = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'subjects' 
      AND TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}'
      ORDER BY ORDINAL_POSITION
    `);

    finalResult[0].slice(-5).forEach(col => {
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

addSubjectColumns();
