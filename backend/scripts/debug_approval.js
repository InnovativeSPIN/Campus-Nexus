import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { StudentLeave, Faculty, ClassIncharge } = models;

const checkData = async () => {
    try {
        const leave = await StudentLeave.findByPk(1, { raw: true });
        console.log('Leave Record:', JSON.stringify(leave, null, 2));

        const faculty = await Faculty.findByPk(406, { raw: true });
        console.log('Faculty Record:', JSON.stringify(faculty, null, 2));

        const incharge = await ClassIncharge.findOne({ where: { faculty_id: 406, status: 'active' }, raw: true });
        console.log('Incharge Record:', JSON.stringify(incharge, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
