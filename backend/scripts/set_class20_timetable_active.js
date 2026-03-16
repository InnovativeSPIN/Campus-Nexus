import { models } from '../models/index.js';

async function main() {
  const result = await models.TimetableMaster.update(
    { status: 'active' },
    { where: { class_id: 20, status: '' } }
  );
  console.log('Updated rows:', result[0]);
  const updated = await models.TimetableMaster.findAll({ where: { class_id: 20 } });
  console.log('Timetable master for class 20:', updated.map(r => r.toJSON()));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
