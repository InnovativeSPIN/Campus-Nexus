import { sequelize } from './config/db.js';
import { models } from './models/index.js';

(async () => {
  try {
    const faculty = await models.Faculty.findByPk(101, {
      attributes: { exclude: ['userId'] },
      include: [{
        model: models.Department,
        as: 'department',
        attributes: ['short_name', 'full_name']
      }]
    });

    if (!faculty) {
      console.error('Faculty not found by Sequelize');
      process.exit(1);
    }

    console.log('✅ Faculty found:', {
      id: faculty.faculty_id,
      name: faculty.Name,
      email: faculty.email,
      department: faculty.department
    });

    process.exit(0);
  } catch (error) {
    console.error('Error loading faculty:', error.message, error.stack);
    process.exit(1);
  }
})();
