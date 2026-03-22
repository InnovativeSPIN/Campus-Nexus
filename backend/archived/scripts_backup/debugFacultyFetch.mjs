import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';

(async () => {
  try {
    initModels();
    const { Faculty, Department } = models;
    const faculty = await Faculty.findByPk(101, {
      attributes: { exclude: ['userId'] },
      include: [{ model: Department, as: 'department', attributes: ['short_name','full_name'] }]
    });
    console.log('faculty found:', faculty && faculty.toJSON());
  } catch (err) {
    console.error('ERROR MESSAGE:', err.message);
    if (err.original) console.error('ORIGINAL:', err.original.sqlMessage || err.original.message || err.original);
    if (err.sql) console.error('SQL:', err.sql);
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();
