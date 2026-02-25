import { sequelize } from './config/db.js';
import fs from 'fs';
import path from 'path';

(async () => {
  try {
    const migrationPath = './migrations/004_fix_experience_table.sql';
    const migration = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing migration: 004_fix_experience_table.sql\n');
    
    // Split by semicolons and filter empty statements
    const statements = migration
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 80)}...`);
      await sequelize.query(statement);
      console.log('✅ Success\n');
    }

    console.log('✅ All migrations executed successfully!');

    // Verify the table structure
    const desc = await sequelize.query('DESC faculty_experience');
    const indexes = await sequelize.query('SHOW INDEXES FROM faculty_experience');

    console.log('\n📋 Table Structure After Migration:');
    console.log(JSON.stringify(desc[0], null, 2));

    console.log('\n📋 Indexes After Migration:');
    console.log(JSON.stringify(indexes[0], null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
