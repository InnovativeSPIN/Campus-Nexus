import { models } from '../models/index.js';

async function main() {
  const student = await models.Student.findByPk(3686);
  console.log('student:', student ? student.toJSON() : null);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
