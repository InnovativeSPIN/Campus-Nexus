import { sequelize } from './config/db.js';
import connectDB from './config/db.js';

const verifySchemChanges = async () => {
    console.log('🔍 Verifying student_projects table schema...\n');
    
    try {
        await connectDB();
        
        const result = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_projects'
            ORDER BY ORDINAL_POSITION
        `, { type: 'SELECT' });
        
        console.log('📋 Current Schema:');
        console.log('='.repeat(100));
        
        result.forEach(col => {
            const nullable = col.IS_NULLABLE === 'YES' ? '✅ NULL' : '❌ NOT NULL';
            const key = col.COLUMN_KEY ? `[${col.COLUMN_KEY}]` : '';
            const defaultVal = col.COLUMN_DEFAULT ? `DEFAULT: ${col.COLUMN_DEFAULT}` : '';
            console.log(
                `${col.COLUMN_NAME.padEnd(20)} | ${col.DATA_TYPE.padEnd(20)} | ${nullable.padEnd(12)} | ${key.padEnd(8)} | ${defaultVal}`
            );
        });
        
        console.log('='.repeat(100));
        console.log('\n✅ Schema verification complete!');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        process.exit(1);
    }
};

verifySchemChanges();
