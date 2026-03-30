import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Faculty, ClassIncharge } = models;
import { Op } from 'sequelize';

const check = async () => {
    try {
        const facultyList = await Faculty.findAll({
            where: { Name: { [Op.like]: '%NAGAJOTHI%' } },
            raw: true
        });
        console.log('Count:', facultyList.length);
        facultyList.forEach(f => {
            console.log(`- ID: ${f.faculty_id}, Name: ${f.Name}, email: ${f.email}, is_class_incharge: ${f.is_class_incharge}`);
        });

        for (const f of facultyList) {
            const incharges = await ClassIncharge.findAll({
                where: { faculty_id: f.faculty_id, status: 'active' },
                raw: true
            });
            console.log(`  Active Class Incharge records for ${f.Name} (ID: ${f.faculty_id}):`, incharges.length);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
