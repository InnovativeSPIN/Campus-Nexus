import { sequelize } from './config/db.js';

const verifyTable = async () => {
    try {
        console.log('Checking current table structure...\n');
        
        const result = await sequelize.query(`
            SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_KEY, EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'faculy_edu_qualification' AND TABLE_SCHEMA = 'eduvertex'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('Table Columns:');
        result[0].forEach(col => {
            console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_KEY || 'NONE'} ${col.EXTRA || ''} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : ''}`);
        });
        
        console.log('\n\nChecking Indexes:');
        const indexes = await sequelize.query(`
            SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_NAME = 'faculy_edu_qualification' AND TABLE_SCHEMA = 'eduvertex'
            ORDER BY INDEX_NAME, SEQ_IN_INDEX
        `);
        
        indexes[0].forEach(idx => {
            console.log(`  ${idx.INDEX_NAME}: ${idx.COLUMN_NAME} (position ${idx.SEQ_IN_INDEX})`);
        });
        
        console.log('\n\nCurrent table can store:');
        const testResult = await sequelize.query(`SELECT COUNT(*) as count FROM faculy_edu_qualification`);
        console.log(`  Total records: ${testResult[0][0].count}`);
        
        const facultyCount = await sequelize.query(`
            SELECT faculty_id, COUNT(*) as records 
            FROM faculy_edu_qualification 
            GROUP BY faculty_id
        `);
        console.log(`  Unique faculties: ${facultyCount[0].length}`);
        console.log(`  Max records per faculty: ${Math.max(...facultyCount[0].map(r => r.records))}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

verifyTable();
