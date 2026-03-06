import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../config/db.js';

const checkSchema = async () => {
    try {
        const [results] = await sequelize.query('DESCRIBE classes');
        console.log('Classes Table:', JSON.stringify(results, null, 2));

        const [results2] = await sequelize.query('DESCRIBE student_profile');
        console.log('Students Table:', JSON.stringify(results2, null, 2));

        const [results3] = await sequelize.query('DESCRIBE class_incharges');
        console.log('ClassIncharges Table:', JSON.stringify(results3, null, 2));

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

checkSchema();
