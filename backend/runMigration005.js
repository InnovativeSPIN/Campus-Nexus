import { sequelize } from './config/db.js';

(async () => {
  try {
    console.log('📝 Executing migration: Add sem_type to subjects table\n');
    
    // Step 1: Add sem_type column if it doesn't exist
    console.log('1. Checking if sem_type column exists...');
    const desc = await sequelize.query('DESC `subjects`');
    const hasColumn = desc[0].some(c => c.Field === 'sem_type');
    
    if (!hasColumn) {
      console.log('   Adding sem_type column...');
      await sequelize.query(`
        ALTER TABLE \`subjects\` 
        ADD COLUMN \`sem_type\` ENUM('odd', 'even') NOT NULL DEFAULT 'odd' AFTER \`semester\`
      `);
      console.log('   ✅ sem_type column added');
    } else {
      console.log('   ℹ️  sem_type column already exists');
    }

    // Step 2: Add indexes
    console.log('\n2. Adding indexes...');
    try {
      await sequelize.query(`
        ALTER TABLE \`subjects\` 
        ADD INDEX \`idx_sem_type\` (\`sem_type\`)
      `);
      console.log('   ✅ Index on sem_type added');
    } catch (e) {
      if (e.message.includes('Duplicate key')) {
        console.log('   ℹ️  Index already exists');
      } else {
        throw e;
      }
    }

    console.log('\n3. Adding composite index...');
    try {
      await sequelize.query(`
        ALTER TABLE \`subjects\` 
        ADD INDEX \`idx_dept_sem\` (\`department_id\`, \`semester\`, \`sem_type\`)
      `);
      console.log('   ✅ Composite index added');
    } catch (e) {
      if (e.message.includes('Duplicate key')) {
        console.log('   ℹ️  Composite index already exists');
      } else {
        throw e;
      }
    }

    // Verify the changes
    console.log('\n4. Verifying changes...');
    const finalDesc = await sequelize.query('DESC `subjects`');
    const semTypeColumn = finalDesc[0].find(c => c.Field === 'sem_type');
    
    if (semTypeColumn) {
      console.log('   ✅ sem_type column verified!');
      console.log('   Type:', semTypeColumn.Type);
      console.log('   Default:', semTypeColumn.Default);
    }

    const indexes = await sequelize.query('SHOW INDEXES FROM `subjects`');
    const semTypeIndex = indexes[0].filter(idx => idx.Column_name === 'sem_type' || idx.Key_name === 'idx_dept_sem');
    console.log('\n   Indexes:', semTypeIndex.map(idx => idx.Key_name).join(', '));

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
