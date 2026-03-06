import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const findStudents = async () => {
    try {
        const students = await Student.findAll({
            where: {
                departmentId: 6,
                semester: [3, 4]
            },
            raw: true
        });
        console.log('Count:', students.length);
        if (students.length > 0) {
            console.log('Sample Student Batch:', students[0].batch);
            console.log('Sample Student Semester:', students[0].semester);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findStudents();
