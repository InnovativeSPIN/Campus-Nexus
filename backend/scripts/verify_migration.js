import { sequelize } from '../config/db.js';

async function verifyTables() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    // Check tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('All tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
    // Check timetable table
    const [timetable] = await sequelize.query('DESCRIBE timetable');
    console.log('\ntimetable table columns:');
    timetable.forEach(col => console.log('  -', col.Field, ':', col.Type));
    
    // Check if timetables table was dropped
    const [timetables] = await sequelize.query('SHOW TABLES LIKE "timetables"');
    console.log('\ntimetables table exists:', timetables.length > 0 ? 'YES (ERROR!)' : 'NO (CORRECT - dropped)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyTables();
