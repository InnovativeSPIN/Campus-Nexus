import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';

const run = async () => {
  try {
    initModels();
    const { FacultyEduQualification } = models;
    const rows = await FacultyEduQualification.findAll({ limit: 20 });
    console.log('rows count:', rows.length);
    rows.forEach(r => {
      console.log(r.get({ plain: true }));
    });
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
  } finally {
    await sequelize.close();
  }
};

run();
