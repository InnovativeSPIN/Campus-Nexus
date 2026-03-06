import dotenv from 'dotenv';
dotenv.config();

import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';

initModels();

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const { User, Faculty } = models;

    const admins = await User.findAll({
      where: { role_id: 7, department_id: { [Op.or]: [null, ''] } }
    });

    if (admins.length === 0) {
      console.log('No department-admin users without department_id found.');
      process.exit(0);
    }

    console.log(`Found ${admins.length} department-admin(s) without department_id`);

    for (const admin of admins) {
      // try to find a matching faculty profile; use email as primary key
      const faculty = await Faculty.findOne({
        where: {
          email: admin.email
        },
        attributes: ['department_id']
      });

      if (faculty && faculty.department_id) {
        admin.department_id = faculty.department_id;
        await admin.save();
        console.log(`Updated user ${admin.email} -> dept ${faculty.department_id}`);
      } else {
        console.warn(`Could not resolve department for ${admin.email}; please update manually.`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error syncing departments:', err.message || err);
    process.exit(1);
  }
}

run();
