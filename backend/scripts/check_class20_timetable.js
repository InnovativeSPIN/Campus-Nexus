import { models } from '../models/index.js';

async function main() {
  const tm = await models.TimetableMaster.findOne({ where: { class_id: 20, status: 'active' } });
  console.log('active timetable_master for class_id=20:', tm ? tm.toJSON() : null);
  const any = await models.TimetableMaster.findAll({ where: { class_id: 20 }, limit: 5 });
  console.log('all timetable_master rows:', any.map(r => r.toJSON()));
  if (tm) {
    const slots = await models.TimetableMasterSlots.findAll({ where: { master_id: tm.id }, limit: 10 });
    console.log('slots count', slots.length);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
