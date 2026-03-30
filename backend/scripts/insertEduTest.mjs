import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';

const run = async () => {
  try {
    initModels();
    const { FacultyEduQualification } = models;
    const created = await FacultyEduQualification.create({ faculty_id: 101, degree: 'Test Degree', branch: 'Test Branch', university: 'Test Univ' });
    console.log('created:', created.get({ plain: true }));
    const rows = await FacultyEduQualification.findAll({ where: { faculty_id: 101 } });
    console.log('rows:', rows.map(r => r.get({ plain: true })));
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
  } finally {
    await sequelize.close();
  }
};

run();
