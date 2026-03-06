import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';

const checkFK = async () => {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                CONSTRAINT_NAME 
            FROM information_schema.key_column_usage 
            WHERE TABLE_NAME = 'student_leaves' 
            AND COLUMN_NAME = 'approvedById'
        `);
        console.log('Constraints:', JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

checkFK();
