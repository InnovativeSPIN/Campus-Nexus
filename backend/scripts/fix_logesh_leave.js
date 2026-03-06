import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { StudentLeave, Student } = models;

const fixLogeshLeave = async () => {
    try {
        // ID 3975 is LOGESH KUMAR R, who belongs to the III Year batch
        const [count] = await StudentLeave.update(
            { classId: 21 },
            { where: { studentId: 3975 } }
        );
        console.log(`Updated ${count} leave records for LOGESH to Class 21.`);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

fixLogeshLeave();
