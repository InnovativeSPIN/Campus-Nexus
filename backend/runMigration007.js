import { sequelize } from './config/db.js';

async function runMigration() {
  try {
    console.log('Running migration: Adding total_hours and no_of_periods to faculty_subject_assignments...');
    
    // Check if columns already exist
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('faculty_subject_assignments');
    
    let altered = false;
    
    if (!tableDescription.total_hours) {
      await sequelize.query(`
        ALTER TABLE faculty_subject_assignments
        ADD COLUMN total_hours INT DEFAULT 0 COMMENT 'Total hours for the subject'
      `);
      console.log('✓ Added total_hours column');
      altered = true;
    } else {
      console.log('✓ total_hours column already exists');
    }
    
    if (!tableDescription.no_of_periods) {
      await sequelize.query(`
        ALTER TABLE faculty_subject_assignments
        ADD COLUMN no_of_periods INT DEFAULT 0 COMMENT 'Number of periods per week'
      `);
      console.log('✓ Added no_of_periods column');
      altered = true;
    } else {
      console.log('✓ no_of_periods column already exists');
    }
    
    if (altered) {
      console.log('\n✓ Migration completed successfully!');
    } else {
      console.log('\n✓ No changes needed - columns already exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
