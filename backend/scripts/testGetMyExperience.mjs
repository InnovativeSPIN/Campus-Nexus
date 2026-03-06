import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';

(async () => {
  try {
    initModels();
    const { Faculty, FacultyExperience } = models;
    const faculty = await Faculty.findOne({ where: { faculty_college_code: 'CS12' }, attributes: ['faculty_id'] });
    console.log('faculty:', faculty && faculty.faculty_id);
    const rows = await FacultyExperience.findAll({ where: { faculty_id: faculty.faculty_id } });
    console.log('experience rows:', rows.map(r => r.toJSON()));
  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.original) console.error('ORIG:', err.original.sqlMessage || err.original.message);
    if (err.sql) console.error('SQL:', err.sql);
  } finally {
    await sequelize.close();
  }
})();
