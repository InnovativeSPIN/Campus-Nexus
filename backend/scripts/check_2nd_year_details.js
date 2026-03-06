import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const findStudents = async () => {
    try {
        const students = await Student.findAll({
            where: { departmentId: 6, semester: 4 },
            attributes: ['id', 'studentId', 'firstName', 'batch', 'semester'],
            raw: true
        });
        console.log(JSON.stringify(students.slice(0, 5), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findStudents();
