import { sequelize, models } from './models/index.js';
import initModels from './models/index.js';

// Initialize models
const allModels = initModels();

const createTables = async () => {
  try {
    console.log('Creating database tables...');
    
    // Sync all models to create tables
    // alter: true will modify existing tables to match the models
    await sequelize.sync({ alter: true });
    
    console.log('\n✅ Database tables created/updated successfully!');
    console.log('\nTables created/updated:');
    console.log('- rooms');
    console.log('- labs');
    console.log('- timetable_periods');
    console.log('- year_break_timings (enhanced with year_group)');
    console.log('- leaves (enhanced with substitution fields)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
