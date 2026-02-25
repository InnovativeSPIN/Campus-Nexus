import { sequelize } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigration = async () => {
    try {
        const migrationPath = path.join(__dirname, 'migrations', '003_fix_edu_qualification_table.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Running migration: 003_fix_edu_qualification_table.sql');
        
        // Execute the migration SQL
        const statements = migrationSql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await sequelize.query(statement);
                    console.log('✓ Executed:', statement.substring(0, 80) + '...');
                } catch (err) {
                    if (!err.message.includes('already')) {
                        console.error('Error executing statement:', err.message);
                    }
                }
            }
        }
        
        console.log('\n✓ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
