/**
 * One-time script to create/alter all student-specific tables.
 * Run: node scripts/sync_student_tables.js
 */
import { sequelize } from '../config/db.js';
import initModels from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected.');

        const models = initModels();
        const studentModels = [
            'StudentLeave',
            'StudentProject',
            'StudentCertification',
            'StudentSport',
            'StudentEvent',
            'StudentMarks',
            'StudentInternalMark',
            'StudentNotification',
            'StudentBio',
        ];

        for (const name of studentModels) {
            const model = models[name];
            if (model) {
                await model.sync({ alter: true });
                console.log(`✓ ${name} table synced.`);
            } else {
                console.warn(`⚠ Model not found: ${name}`);
            }
        }

        console.log('\nAll student tables synced successfully!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sequelize.close();
    }
};

run();
