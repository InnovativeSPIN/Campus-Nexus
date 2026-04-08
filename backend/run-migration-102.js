import { sequelize } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', '102-add-break-period-configuration.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`\n🔄 Running migration: 102-add-break-period-configuration.sql\n`);
    
    for (const statement of statements) {
      try {
        await sequelize.query(statement);
        console.log('✅ Executed:', statement.substring(0, 60) + '...');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('Duplicate column')) {
          console.log('⚠️  Column already exists (skipping):', error.message);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message, '\n');
    process.exit(1);
  }
};

runMigration();
