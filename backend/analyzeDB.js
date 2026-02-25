import { sequelize } from './config/db.js';

(async () => {
  try {
    console.log('=== ANALYZING TABLE STRUCTURE ===\n');
    
    const cols = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'faculy_edu_qualification' AND TABLE_SCHEMA = 'eduvertex'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Column Structure:');
    cols[0].forEach(c => {
      const nullable = c.IS_NULLABLE === 'YES' ? 'NULLABLE' : 'NOT NULL';
      const key = c.COLUMN_KEY ? `[${c.COLUMN_KEY}]` : '';
      const ext = c.EXTRA ? `(${c.EXTRA})` : '';
      const def = c.COLUMN_DEFAULT ? `DEFAULT: ${c.COLUMN_DEFAULT}` : '';
      console.log(`  ✓ ${c.COLUMN_NAME.padEnd(15)} ${c.COLUMN_TYPE.padEnd(20)} ${nullable.padEnd(10)} ${key.padEnd(6)} ${ext.padEnd(20)} ${def}`);
    });
    
    console.log('\n=== CHECKING CONSTRAINTS ===\n');
    
    const constraints = await sequelize.query(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'faculy_edu_qualification' AND TABLE_SCHEMA = 'eduvertex'
    `);
    
    constraints[0].forEach(c => {
      console.log(`  ✓ ${c.CONSTRAINT_NAME}: ${c.CONSTRAINT_TYPE}`);
    });
    
    console.log('\n=== CURRENT DATA ===\n');
    
    const data = await sequelize.query(`SELECT * FROM faculy_edu_qualification LIMIT 3`);
    console.log(`Total Records: ${data[0].length}`);
    if (data[0].length > 0) {
      console.log('\nSample Records:');
      data[0].forEach((row, idx) => {
        console.log(`  Record ${idx + 1}:`, JSON.stringify(row, null, 2).split('\n').join('\n    '));
      });
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Database Error:', e.message);
    process.exit(1);
  }
})();
