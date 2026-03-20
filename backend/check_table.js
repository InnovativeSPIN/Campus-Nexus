import { sequelize } from './config/db.js';

async function check() {
  try {
    const [leave] = await sequelize.query("SHOW CREATE TABLE student_leaves");
    console.log("LEAVES:", leave[0]['Create Table']);
    
    const [sport] = await sequelize.query("SHOW CREATE TABLE student_sports");
    console.log("SPORTS:", sport[0]['Create Table']);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
