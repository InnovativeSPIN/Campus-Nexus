import { sequelize } from './config/db.js';

(async () => {
  try {
    console.log('🔍 Checking faculty_industry_experience table structure...\n');
    
    const desc = await sequelize.query('DESC faculty_industry_experience');
    const pk = desc[0].filter(c => c.Key === 'PRI');
    
    console.log('PRIMARY KEY columns:');
    console.log(pk.map(c => ({Field: c.Field, Type: c.Type})));
    
    const fk = await sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'faculty_industry_experience' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\nForeign keys:');
    console.log(JSON.stringify(fk[0], null, 2));
    
    if (pk.length === 0) {
      console.log('\n⚠️  Warning: No PRIMARY KEY found!');
    } else {
      console.log(`\n✅ Tables has PRIMARY KEY on: ${pk.map(c => c.Field).join(', ')}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
