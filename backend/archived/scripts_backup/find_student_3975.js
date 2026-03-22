import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const findStudent = async () => {
    try {
        const student = await Student.findByPk(3975, { raw: true });
        console.log(JSON.stringify(student, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

findStudent();
