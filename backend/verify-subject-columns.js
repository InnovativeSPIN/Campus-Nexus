import { sequelize } from './config/db.js';

async function verifyColumns() {
  try {
    await sequelize.authenticate();
    const result = await sequelize.query('DESCRIBE subjects');
    const allCols = result[0];
    
    console.log('\n✅ All columns in subjects table:\n');
    allCols.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field}: ${col.Type}`);
    });
    
    // Check for our new columns
    const hasCategory = allCols.some(c => c.Field === 'subject_category');
    const hasAvailable = allCols.some(c => c.Field === 'available_to_all_departments');
    
    console.log('\n' + (hasCategory ? '✅' : '❌') + ' subject_category column exists');
    console.log((hasAvailable ? '✅' : '❌') + ' available_to_all_departments column exists');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyColumns();
