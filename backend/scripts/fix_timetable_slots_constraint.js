import { sequelize } from '../config/db.js';

async function fixTimetableSlotsConstraint() {
  try {
    console.log('Fixing timetable_slots unique constraint...');
    
    // Drop the previous constraint if it exists
    try {
      await sequelize.query(`
        ALTER TABLE timetable_slots 
        DROP INDEX uk_timetable_slots_faculty_day_time
      `);
      console.log('Dropped previous constraint');
    } catch (e) {
      console.log('Note: Previous constraint may not exist:', e.message);
    }
    
    // Add the correct composite unique constraint: (timetable_id, day, start_time)
    // as requested by user
    console.log('Adding composite unique constraint on (timetable_id, day, start_time)...');
    try {
      await sequelize.query(`
        ALTER TABLE timetable_slots 
        ADD CONSTRAINT uk_timetable_slots_timetable_day_time 
        UNIQUE (timetable_id, day, start_time)
      `);
      console.log('✅ Composite unique constraint added successfully!');
    } catch (e) {
      if (e.message.includes('Duplicate key') || e.message.includes('Duplicate entry')) {
        console.log('Note: Some duplicate entries exist, cleaning up...');
        
        // Clean up duplicates - keep first entry for each (timetable_id, day, start_time)
        const [dups] = await sequelize.query(`
          SELECT timetable_id, day, start_time, COUNT(*) as cnt 
          FROM timetable_slots 
          GROUP BY timetable_id, day, start_time 
          HAVING COUNT(*) > 1
        `);
        
        if (dups && dups.length > 0) {
          for (const dup of dups) {
            // Use parameterized query to find duplicate entries safely
            const [toKeep] = await sequelize.query(
              `SELECT id FROM timetable_slots 
               WHERE timetable_id = ? AND day = ? AND start_time = ?
               ORDER BY id LIMIT 1`,
              {
                replacements: [dup.timetable_id, dup.day, dup.start_time],
                type: sequelize.QueryTypes.SELECT
              }
            );
            
            if (toKeep && toKeep.id) {
              // Use parameterized query for delete to prevent SQL injection
              await sequelize.query(
                `DELETE FROM timetable_slots 
                 WHERE timetable_id = ? AND day = ? AND start_time = ? AND id != ?`,
                {
                  replacements: [dup.timetable_id, dup.day, dup.start_time, toKeep.id],
                  type: sequelize.QueryTypes.DELETE
                }
              );
            }
          }
        }
        
        // Try adding constraint again
        await sequelize.query(`
          ALTER TABLE timetable_slots 
          ADD CONSTRAINT uk_timetable_slots_timetable_day_time 
          UNIQUE (timetable_id, day, start_time)
        `);
        console.log('✅ Composite unique constraint added after cleanup!');
      } else {
        console.log('Note:', e.message);
      }
    }
    
    // Verify current indexes
    const [indexes] = await sequelize.query('SHOW INDEX FROM timetable_slots WHERE Non_unique = 0');
    console.log('Current unique indexes on timetable_slots:');
    for (const idx of indexes) {
      console.log(`  - ${idx.Key_name}: ${idx.Column_name}`);
    }
    
    // Show final row count
    const [finalRows] = await sequelize.query('SELECT COUNT(*) as cnt FROM timetable_slots');
    console.log(`Final row count: ${finalRows[0].cnt}`);
    
    console.log('✅ Timetable slots constraint fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing constraint:', error);
    process.exit(1);
  }
}

fixTimetableSlotsConstraint();
