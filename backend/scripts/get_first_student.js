import { models } from '../models/index.js';

async function main() {
  const student = await models.Student.findOne({
    attributes: ['id', 'firstName', 'lastName', 'rollNumber']
  });
  console.log('Student:', student ? {
    id: student.id,
    name: student.firstName + ' ' + student.lastName,
    rollNo: student.rollNumber
  } : 'No student found');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
