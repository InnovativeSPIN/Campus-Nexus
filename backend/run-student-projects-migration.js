import fs from 'fs';
import path from 'path';
import { sequelize } from './config/db.js';
import connectDB from './config/db.js';

const runMigration = async () => {
    console.log('🔄 Starting database migration...\n');
    
    try {
        // Connect to database
        await connectDB();
        
        // Read the migration file
        const migrationFile = path.join(process.cwd(), 'migrations', '020_fix_student_projects_schema.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        console.log('📝 Executing migration SQL...');
        
        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            console.log(`\n📌 Executing: ${statement.substring(0, 60)}...`);
            try {
                await sequelize.query(statement);
                console.log('✅ Statement executed successfully');
            } catch (err) {
                // If the error is about the constraint already existing, that's okay
                if (err.message.includes('Duplicate') || err.message.includes('already exists')) {
                    console.log('⚠️  Constraint already exists (skipping)');
                } else {
                    throw err;
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigration();
