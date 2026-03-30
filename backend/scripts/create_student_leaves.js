/**
 * One-time script to create the student_leaves table if it doesn't exist.
 * Run: node scripts/create_student_leaves.js
 */
import { sequelize } from '../config/db.js';
import initModels from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected.');

        const { StudentLeave } = initModels();

        // sync ONLY the StudentLeave model – safe, won't touch other tables
        await StudentLeave.sync({ alter: true });
        console.log('student_leaves table created/updated successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sequelize.close();
    }
};

run();
