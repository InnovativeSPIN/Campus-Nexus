import { sequelize } from './config/db.js';

(async () => {
  try {
    console.log('🔍 Checking foreign key constraints...\n');

    // Get all foreign keys
    const fkConstraints = await sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'faculty_experience' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('📋 Foreign Key constraints found:');
    console.log(JSON.stringify(fkConstraints[0], null, 2));

    // Drop foreign key constraints
    const fkNames = new Set();
    for (const fk of fkConstraints[0]) {
      fkNames.add(fk.CONSTRAINT_NAME);
    }

    console.log('\n⚙️  Dropping foreign key constraints...');
    for (const fkName of fkNames) {
      console.log(`   Dropping ${fkName}...`);
      try {
        await sequelize.query(`ALTER TABLE \`faculty_experience\` DROP FOREIGN KEY \`${fkName}\``);
        console.log(`   ✅ ${fkName} dropped`);
      } catch (err) {
        console.log(`   ⚠️  ${fkName} error: ${err.message}`);
      }
    }

    // Now drop the primary key
    console.log('\n⚙️  Dropping current PRIMARY KEY...');
    await sequelize.query('ALTER TABLE `faculty_experience` DROP PRIMARY KEY');
    console.log('✅ PRIMARY KEY dropped');

    // Add new primary key on exp_id
    console.log('\n⚙️  Adding PRIMARY KEY on exp_id...');
    await sequelize.query('ALTER TABLE `faculty_experience` ADD PRIMARY KEY (`exp_id`)');
    console.log('✅ PRIMARY KEY added on exp_id');

    // Ensure auto_increment
    console.log('\n⚙️  Ensuring exp_id has auto_increment...');
    try {
      await sequelize.query('ALTER TABLE `faculty_experience` CHANGE COLUMN `exp_id` `exp_id` INT(11) NOT NULL AUTO_INCREMENT');
      console.log('✅ auto_increment set on exp_id');
    } catch (err) {
      console.log(`⚠️  ${err.message}`);
    }

    // Add unique constraint or index on faculty_id (optional but good for performance)
    console.log('\n⚙️  Adding index on faculty_id...');
    try {
      await sequelize.query('ALTER TABLE `faculty_experience` ADD INDEX `idx_faculty_id` (`faculty_id`)');
      console.log('✅ Index added on faculty_id');
    } catch (err) {
      if (err.message.includes('Duplicate key')) {
        console.log('⚠️  Index already exists on faculty_id');
      } else {
        console.log(`⚠️  Index error: ${err.message}`);
      }
    }

    // Re-add the foreign key constraint
    console.log('\n⚙️  Re-adding foreign key constraint...');
    try {
      await sequelize.query(`
        ALTER TABLE \`faculty_experience\` 
        ADD CONSTRAINT \`faculty_experience_ibfk_1\` 
        FOREIGN KEY (\`faculty_id\`) 
        REFERENCES \`faculty_profiles\`(\`faculty_id\`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      `);
      console.log('✅ Foreign key constraint re-added');
    } catch (err) {
      console.log(`⚠️  Foreign key error: ${err.message}`);
    }

    // Verify the fix
    console.log('\n📋 Verifying table structure after fix:');
    const desc = await sequelize.query('DESC `faculty_experience`');
    console.log(JSON.stringify(desc[0], null, 2));

    console.log('\n📋 Current indexes and constraints:');
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
    process.exit(1);
  }
})();
