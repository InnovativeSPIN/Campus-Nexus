import { sequelize, models } from '../models/index.js';

const { TimetableMaster } = models;

async function fixTimetableStatus() {
  try {
    console.log('[FIX TIMETABLE STATUS] Starting...');
    
    // Find all timetables with empty status
    const emptyStatusTimetables = await TimetableMaster.findAll({
      where: { status: '' }
    });

    console.log(`[FIX TIMETABLE STATUS] Found ${emptyStatusTimetables.length} timetables with empty status`);
    
    if (emptyStatusTimetables.length === 0) {
      console.log('[FIX TIMETABLE STATUS] No empty status found. All good!');
      process.exit(0);
    }

    // Update all empty statuses to 'draft'
    await TimetableMaster.update(
      { status: 'draft' },
      { where: { status: '' } }
    );

    // Verify the fix
    const updated = await TimetableMaster.findAll({
      attributes: ['id', 'status'],
      order: [['id', 'ASC']]
    });

    console.log('[FIX TIMETABLE STATUS] Updated timetables:');
    updated.forEach(t => {
      console.log(`  - ID ${t.id}: status = "${t.status}"`);
    });

    console.log('[FIX TIMETABLE STATUS] ✅ All empty statuses fixed to "draft"');
    process.exit(0);
  } catch (error) {
    console.error('[FIX TIMETABLE STATUS] ❌ Error:', error);
    process.exit(1);
  }
}

fixTimetableStatus();
