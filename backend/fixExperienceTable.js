import { sequelize } from './config/db.js';

(async () => {
  try {
    console.log('🔍 Checking current table structure...\n');

    // Check current primary key
    const keyInfo = await sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, ORDINAL_POSITION 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'faculty_experience' 
      AND CONSTRAINT_NAME = 'PRIMARY'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📝 Current PRIMARY KEY columns:');
    console.log(JSON.stringify(keyInfo[0], null, 2));

    // Check for foreign key constraints
    const fkInfo = await sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'faculty_experience' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\n🔗 Foreign Key constraints:');
    console.log(JSON.stringify(fkInfo[0], null, 2));

    // Drop existing primary key
    console.log('\n⚙️  Dropping current PRIMARY KEY...');
    await sequelize.query('ALTER TABLE `faculty_experience` DROP PRIMARY KEY');
    console.log('✅ PRIMARY KEY dropped');

    // Add new primary key on exp_id
    console.log('\n⚙️  Adding PRIMARY KEY on exp_id...');
    await sequelize.query('ALTER TABLE `faculty_experience` ADD PRIMARY KEY (`exp_id`)');
    console.log('✅ PRIMARY KEY added on exp_id');

    // Ensure auto_increment
    console.log('\n⚙️  Ensuring exp_id has auto_increment...');
    await sequelize.query('ALTER TABLE `faculty_experience` CHANGE `exp_id` `exp_id` INT(11) NOT NULL AUTO_INCREMENT');
    console.log('✅ auto_increment set on exp_id');

    // Check if index exists, if not add it
    console.log('\n⚙️  Adding index on faculty_id...');
    try {
      await sequelize.query('ALTER TABLE `faculty_experience` ADD INDEX `idx_faculty_id` (`faculty_id`)');
      console.log('✅ Index added on faculty_id');
    } catch (err) {
      if (err.message.includes('Duplicate key')) {
        console.log('⚠️  Index already exists on faculty_id');
      } else {
        throw err;
      }
    }

    // Verify the fix
    console.log('\n📋 Verifying table structure after fix:');
    const desc = await sequelize.query('DESC `faculty_experience`');
    console.log(JSON.stringify(desc[0], null, 2));

    console.log('\n📋 Current indexes:');
    const indexes = await sequelize.query('SHOW INDEXES FROM `faculty_experience`');
    const indexList = indexes[0].map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Non_unique: idx.Non_unique
    }));
    console.log(JSON.stringify(indexList, null, 2));

    console.log('\n✅ Table structure fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
