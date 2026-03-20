import { sequelize } from './config/db.js';
import fs from 'fs';

async function check() {
  const [leave] = await sequelize.query("SHOW CREATE TABLE student_leaves");
  const [sport] = await sequelize.query("SHOW CREATE TABLE student_sports");
  const [cert] = await sequelize.query("SHOW CREATE TABLE student_certifications");
  const [event] = await sequelize.query("SHOW CREATE TABLE student_events");

  const output = `
LEAVES:
${leave[0]['Create Table']}

SPORTS:
${sport[0]['Create Table']}

CERTS:
${cert[0]['Create Table']}

EVENTS:
${event[0]['Create Table']}
  `;
  fs.writeFileSync('table_structure.txt', output);
  process.exit(0);
}

check();
