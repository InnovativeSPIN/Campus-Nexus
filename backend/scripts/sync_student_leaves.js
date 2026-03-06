import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { StudentLeave, Student } = models;

const syncLeaves = async () => {
    try {
        // Find all student leaves where classId is null or mismatch
        const students = await Student.findAll({
            where: { departmentId: 6 },
            attributes: ['id', 'classId'],
            raw: true
        });

        for (const student of students) {
            if (student.classId) {
                const [count] = await StudentLeave.update(
                    { classId: student.classId },
                    { where: { studentId: student.id } }
                );
                if (count > 0) {
                    console.log(`Updated ${count} leave records for student ID ${student.id} to class ${student.classId}`);
                }
            }
        }
        console.log('Sync completed.');
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

syncLeaves();
