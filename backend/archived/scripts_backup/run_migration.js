import { sequelize } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    console.log('Starting migration...'.cyan);
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', '009_create_timetable_simple.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute the migration
    await sequelize.query(sql);
    
    console.log('Migration completed successfully!'.green);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:'.red, error.message);
    process.exit(1);
  }
};

runMigration();
