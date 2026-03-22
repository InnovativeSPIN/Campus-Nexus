import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';

const test = async () => {
  try {
    // ensure models are initialized
    initModels();
    const { Faculty, FacultyEduQualification } = models;
    const faculty = await Faculty.findOne({ where: { faculty_college_code: 'CS12' }, attributes: ['faculty_id'] });
    console.log('faculty:', faculty && faculty.faculty_id);
    const edu = await FacultyEduQualification.findOne({ where: { faculty_id: faculty.faculty_id } });
    console.log('education:', edu);
  } catch (err) {
    console.error('TEST ERROR:', err && err.message ? err.message : err);
    console.error(err);
  } finally {
    await sequelize.close();
  }
};

test();
