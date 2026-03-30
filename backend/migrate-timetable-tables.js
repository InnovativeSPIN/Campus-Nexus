import { sequelize, models } from './models/index.js';
import initModels from './models/index.js';

// Initialize models
const allModels = initModels();

const createNewTables = async () => {
  try {
    console.log('Creating new timetable management tables...\n');
    
    // Create only the new tables individually
    const { Room, Lab, TimetablePeriod } = models;
    
    // Create rooms table
    console.log('Creating rooms table...');
    await Room.sync({ force: false, alter: true });
    console.log('✅ Rooms table created/updated');
    
    // Create labs table
    console.log('Creating labs table...');
    await Lab.sync({ force: false, alter: true });
    console.log('✅ Labs table created/updated');
    
    // Create timetable_periods table
    console.log('Creating timetable_periods table...');
    await TimetablePeriod.sync({ force: false, alter: true });
    console.log('✅ Timetable periods table created/updated');
    
    // Update year_break_timings table with new year_group field
    console.log('\nUpdating year_break_timings table...');
    await sequelize.query(`
      ALTER TABLE year_break_timings 
      ADD COLUMN IF NOT EXISTS year_group ENUM('year_1', 'year_2', 'year_3_4') AFTER department_id,
      ADD COLUMN IF NOT EXISTS break_type ENUM('short', 'lunch') AFTER break_name,
      ADD COLUMN IF NOT EXISTS break_number INT AFTER year,
      ADD COLUMN IF NOT EXISTS period_after INT AFTER break_number;
    `).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠️ Columns already exist, skipping...');
      } else {
        throw err;
      }
    });
    console.log('✅ Year break timings table updated');
    
    // Update leaves table with substitution fields
    console.log('\nUpdating leaves table...');
    await sequelize.query(`
      ALTER TABLE leaves 
      ADD COLUMN IF NOT EXISTS affected_periods JSON AFTER applicantType,
      ADD COLUMN IF NOT EXISTS substitute_faculty_code VARCHAR(50) AFTER affected_periods,
      ADD COLUMN IF NOT EXISTS substitute_status ENUM('pending', 'accepted', 'rejected') AFTER substitute_faculty_code,
      ADD COLUMN IF NOT EXISTS substitute_notified_at DATETIME AFTER substitute_status,
      ADD COLUMN IF NOT EXISTS substitute_response_at DATETIME AFTER substitute_notified_at,
      ADD COLUMN IF NOT EXISTS substitute_remarks TEXT AFTER substitute_response_at,
      ADD COLUMN IF NOT EXISTS admin_approval_status ENUM('pending', 'approved', 'rejected') AFTER substitute_remarks,
      ADD COLUMN IF NOT EXISTS admin_approval_date DATETIME AFTER admin_approval_status,
      ADD COLUMN IF NOT EXISTS timetable_altered BOOLEAN DEFAULT FALSE AFTER admin_approval_date;
    `).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠️ Columns already exist, skipping...');
      } else {
        throw err;
      }
    });
    console.log('✅ Leaves table updated');
    
    console.log('\n✅ All new tables created/updated successfully!');
    console.log('\nSummary of changes:');
    console.log('1. ✅ rooms - New table for classroom management');
    console.log('2. ✅ labs - New table for lab management');
    console.log('3. ✅ timetable_periods - New table for period-based timetables');
    console.log('4. ✅ year_break_timings - Enhanced with year_group, break_type, etc.');
    console.log('5. ✅ leaves - Enhanced with substitution workflow fields');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating tables:', error.message);
    console.error(error);
    process.exit(1);
  }
};

createNewTables();
