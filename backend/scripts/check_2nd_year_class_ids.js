import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const checkStudents = async () => {
    try {
        const students = await Student.findAll({
            where: { departmentId: 6, semester: 4 },
            attributes: ['id', 'studentId', 'firstName', 'classId'],
            raw: true
        });
        console.log(JSON.stringify(students.slice(0, 10), null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

checkStudents();
