import { sequelize } from './config/db.js';

(async () => {
  try {
    const desc = await sequelize.query('DESC faculy_edu_qualification');
    console.log('📋 Table Structure:');
    console.log(JSON.stringify(desc[0], null, 2));
    
    console.log('\n📊 Sample Data:');
    const data = await sequelize.query('SELECT * FROM faculy_edu_qualification LIMIT 3');
    console.log(JSON.stringify(data[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
