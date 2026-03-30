import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const check = async () => {
    try {
        const students = await Student.findAll({
            where: { classId: 21 },
            attributes: ['id', 'studentId', 'firstName', 'batch', 'semester'],
            raw: true
        });
        const batches = [...new Set(students.map(s => s.batch))];
        console.log('Total students in Class 21:', students.length);
        console.log('Batches found:', batches);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

check();
