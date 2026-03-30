import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Student } = models;

const checkUnmapped = async () => {
    try {
        const students = await Student.findAll({
            where: { batch: '2025-2029', departmentId: 6 },
            attributes: ['id', 'studentId', 'firstName', 'batch', 'semester'],
            raw: true
        });
        console.log('Total 1st year AIDS students:', students.length);
        console.log('Sample semester:', students[0].semester);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

checkUnmapped();
