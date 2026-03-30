import dotenv from 'dotenv';
dotenv.config();

import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';

(async () => {
  try {
    initModels();
    await sequelize.authenticate();
    console.log('DB connected');

    const { Faculty, FacultyPhd } = models;
    const faculty = await Faculty.findOne({});
    if (!faculty) {
      console.error('No faculty rows found');
      process.exit(1);
    }
    console.log('Using faculty_id', faculty.faculty_id);

    const phd = await FacultyPhd.create({
      faculty_id: faculty.faculty_id,
      status: 'Pursuing',
      orcid_id: '0000-0000-0000-0000',
      thesis_title: 'Test insertion via script',
      register_no: 'TEST-123',
      guide_name: 'Dr. Script'
    });

    console.log('Inserted PhD row:', phd.get ? phd.get({ plain: true }) : phd);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
