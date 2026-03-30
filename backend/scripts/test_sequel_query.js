import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Faculty, ClassIncharge, Class, Department } = models;
import { Op } from 'sequelize';

const check = async () => {
    try {
        const facultyId = 406;
        const incharge = await ClassIncharge.findOne({
            where: { faculty_id: facultyId, status: 'active' },
            include: [
                {
                    model: Class,
                    as: 'class',
                    attributes: ['id', 'name', 'section', 'semester', 'batch', 'capacity', 'department_id'],
                    include: [
                        { model: Department, as: 'department', attributes: ['short_name', 'full_name'] }
                    ]
                }
            ]
        });

        if (!incharge) {
            console.log('NO INCHARGE RECORD FOUND BY SEQUELIZE');
            // Try without include
            const rawIncharge = await ClassIncharge.findOne({
                where: { faculty_id: facultyId, status: 'active' },
                raw: true
            });
            console.log('Raw Incharge (no include):', rawIncharge);
        } else {
            console.log('SUCCESS! Record found with include:');
            console.log(JSON.stringify(incharge.toJSON(), null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error('ERROR in Sequelize query:');
        console.error(err);
        process.exit(1);
    }
};

check();
