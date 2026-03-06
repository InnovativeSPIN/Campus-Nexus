import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const check = async () => {
    try {
        const students = await Student.findAll({
            where: {
                departmentId: 6,
                batch: ['2023-2027', '2023-27']
            },
            attributes: ['id', 'studentId', 'firstName', 'batch', 'semester'],
            raw: true
        });
        console.log('Total students in 3rd year batch:', students.length);
        const semesters = [...new Set(students.map(s => s.semester))];
        console.log('Semesters found:', semesters);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

check();
