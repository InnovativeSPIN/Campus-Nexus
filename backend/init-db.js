import { sequelize } from './config/db.js';
import initModels from './models/index.js';

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Initialize all models (associations)
    initModels();

    // Sync only the Leave model to create the table if it doesn't exist
    // This will NOT alter existing tables
    const models = sequelize.models;
    const LeaveModel = models.Leave;

    if (!LeaveModel) {
      throw new Error('Leave model not found in sequelize.models');
    }

    // Check if table exists
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes('leaves')) {
      console.log('Creating leaves table...');
      await LeaveModel.sync({ force: false });
      console.log('✓ Leaves table created successfully');
    } else {
      console.log('✓ Leaves table already exists');
    }

    console.log('✓ Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

initializeDatabase();
