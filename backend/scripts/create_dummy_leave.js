import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { StudentLeave } = models;

const createDummyLeave = async () => {
    try {
        const leave = await StudentLeave.create({
            studentId: 3686, // ABARNA (2nd Year AIDS)
            classId: 22,    // II Year AIDS
            leaveType: 'Leave',
            leaveSubType: 'Personal Leave',
            startDate: '2026-03-06',
            endDate: '2026-03-07',
            totalDays: 2.0,
            reason: 'Attending family function',
            status: 'pending'
        });
        console.log('Dummy leave created:', leave.id);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

createDummyLeave();
