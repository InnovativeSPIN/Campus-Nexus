import { sequelize } from './config/db.js';
import { up as upEmis } from './migrations/add_emis_no_to_student_profile.js';
import { up as upMultiLevel } from './migrations/add_multilevel_approval_to_leave.js';
import initModels from './models/index.js';

const runMigrations = async () => {
  try {
    console.log('Starting migrations...');

    // Initialize all models (associations)
    initModels();

    // Migration 1: Add EMIS number to student profile
    console.log('\n📋 Running Migration 1: Add EMIS number to student profile...');
    try {
      await upEmis(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log('✓ Migration 1 completed successfully');
    } catch (error) {
      console.warn('⚠ Migration 1 warning:', error.message);
      // Continue to next migration even if this one fails
    }

    // Migration 2: Add multi-level approval fields to Leave table
    console.log('\n📋 Running Migration 2: Add multi-level approval to Leave...');
    try {
      await upMultiLevel(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log('✓ Migration 2 completed successfully');
    } catch (error) {
      console.error('✗ Migration 2 failed:', error.message);
      throw error;
    }

    console.log('\n✓ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration process failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

runMigrations();
