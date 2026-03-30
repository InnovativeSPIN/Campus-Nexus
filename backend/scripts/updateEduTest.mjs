import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';

const run = async () => {
  try {
    initModels();
    const { FacultyEduQualification } = models;
    const edu = await FacultyEduQualification.findByPk(1);
    if (!edu) { console.log('not found'); return; }
    const updated = await edu.update({ degree: 'Updated Degree' });
    console.log('updated:', updated.get({ plain: true }));
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
  } finally {
    await sequelize.close();
  }
};

run();
