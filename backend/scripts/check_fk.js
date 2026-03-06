import dotenv from 'dotenv';
dotenv.config();
import { models, sequelize } from '../models/index.js';

const checkFK = async () => {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                column_name, 
                referenced_table_name, 
                referenced_column_name 
            FROM information_schema.key_column_usage 
            WHERE table_name = 'student_leaves' 
            AND column_name = 'approvedById'
        `);
        console.log('FK Information:', JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkFK();
