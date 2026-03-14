import { models } from '../backend/models/index.js';

async function main() {
  const { Subject } = models;
  const id = 97;
  const subject = await Subject.findByPk(id);
  if (!subject) {
    console.error('Subject not found');
    process.exit(1);
  }
  subject.batch = '2025';
  await subject.save();
  console.log('Updated batch for subject', id);
  const updated = await Subject.findByPk(id);
  console.log({ id: updated.id, batch: updated.batch });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});