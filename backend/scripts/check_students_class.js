import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const check = async () => {
    try {
        const students = await Student.findAll({
            where: { classId: 21 },
            raw: true
        });
        console.log('Students in Class 21:', students.length);
        if (students.length > 0) {
            console.log('Sample Student:', JSON.stringify(students[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
