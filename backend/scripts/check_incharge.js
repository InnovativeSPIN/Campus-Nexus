import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Faculty, ClassIncharge } = models;
import { Op } from 'sequelize';

const check = async () => {
    try {
        const faculty = await Faculty.findOne({
            where: { Name: { [Op.like]: '%Nagajothi%' } },
            raw: true
        });
        console.log('Faculty Info:', JSON.stringify(faculty, null, 2));

        if (faculty) {
            const incharges = await ClassIncharge.findAll({
                where: { faculty_id: faculty.faculty_id },
                raw: true
            });
            console.log('Class Incharge Records:', JSON.stringify(incharges, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
