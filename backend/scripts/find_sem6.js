import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const findSem6 = async () => {
    try {
        const students = await Student.findAll({
            where: { departmentId: 6, semester: 6 },
            attributes: ['id', 'studentId', 'firstName', 'batch', 'semester'],
            raw: true
        });
        console.log('Total students in Dept 6, Sem 6:', students.length);
        console.log(JSON.stringify(students.slice(0, 5), null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

findSem6();
