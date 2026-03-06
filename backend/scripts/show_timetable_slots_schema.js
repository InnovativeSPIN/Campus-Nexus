import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/db.js';
import { QueryTypes } from 'sequelize';

(async () => {
  try {
    await sequelize.authenticate();
    const res = await sequelize.query('SHOW CREATE TABLE `timetable_slots`;', { type: QueryTypes.SELECT });
    console.log(res[0]['Create Table']);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
