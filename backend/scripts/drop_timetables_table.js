import { sequelize } from '../config/db.js';

async function dropTable() {
  try {
    console.log('Starting table drop...');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Disabled FK checks');
    
    // Try to drop the table
    const [results] = await sequelize.query('DROP TABLE IF EXISTS timetables');
    console.log('Query results:', results);
    console.log('Dropped timetables table');
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Enabled FK checks');
    
    // Verify the table is gone
    const [tables] = await sequelize.query('SHOW TABLES LIKE "timetables"');
    console.log('Tables found:', tables.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    // Make sure to re-enable FK checks on error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {}
    process.exit(1);
  }
}

dropTable();
