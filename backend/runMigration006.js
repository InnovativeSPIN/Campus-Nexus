import { sequelize } from './config/db.js';

(async () => {
  try {
    console.log('📝 Executing migration: Ensure sem_type column exists with proper configuration\n');
    
    // Step 1: Check if sem_type column exists
    console.log('1. Checking if sem_type column exists...');
    const desc = await sequelize.query('DESC `subjects`');
    const semTypeColumn = desc[0].find(c => c.Field === 'sem_type');
    
    if (!semTypeColumn) {
      console.log('   Adding sem_type column...');
      await sequelize.query(`
        ALTER TABLE \`subjects\` 
        ADD COLUMN \`sem_type\` ENUM('odd', 'even') DEFAULT 'odd' AFTER \`semester\`
      `);
      console.log('   ✅ sem_type column added');
    } else {
      console.log('   ℹ️  sem_type column already exists');
      console.log('   Type:', semTypeColumn.Type);
      console.log('   Null:', semTypeColumn.Null);
    }

    // Step 2: Ensure all existing subjects have a value for sem_type
    console.log('\n2. Updating subjects without sem_type value...');
    const updateResult = await sequelize.query(`
      UPDATE \`subjects\` SET \`sem_type\` = 'odd' WHERE \`sem_type\` IS NULL
    `);
    console.log(`   ✅ Updated ${updateResult[1]} rows`);

    // Step 3: Add indexes if they don't exist
    console.log('\n3. Adding indexes...');
    
    // Get existing indexes
    const indexes = await sequelize.query("SHOW INDEX FROM `subjects`");
    const indexNames = indexes[0].map(idx => idx.Key_name);
    
    if (!indexNames.includes('idx_sem_type')) {
      console.log('   Adding index on sem_type...');
      await sequelize.query(`
        ALTER TABLE \`subjects\` 
        ADD INDEX \`idx_sem_type\` (\`sem_type\`)
      `);
      console.log('   ✅ Index on sem_type added');
    } else {
      console.log('   ℹ️  Index idx_sem_type already exists');
    }

    if (!indexNames.includes('idx_dept_sem')) {
      console.log('   Adding composite index on department_id, semester, sem_type...');
      await sequelize.query(`
        ALTER TABLE \`subjects\` 
        ADD INDEX \`idx_dept_sem\` (\`department_id\`, \`semester\`, \`sem_type\`)
      `);
      console.log('   ✅ Composite index added');
    } else {
      console.log('   ℹ️  Index idx_dept_sem already exists');
    }

    // Step 4: Verify the changes
    console.log('\n4. Verifying changes...');
    const finalDesc = await sequelize.query('DESCRIBE `subjects`');
    const finalSemType = finalDesc[0].find(c => c.Field === 'sem_type');
    
    if (finalSemType) {
      console.log('   ✅ sem_type column verified!');
      console.log('   Type:', finalSemType.Type);
      console.log('   Default:', finalSemType.Default);
      console.log('   Null:', finalSemType.Null);
    }

    console.log('\n✅ Migration 006 completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
