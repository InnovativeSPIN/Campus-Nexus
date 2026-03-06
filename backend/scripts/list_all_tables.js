import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';

const listTables = async () => {
    try {
        const [results] = await sequelize.query('SHOW TABLES');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listTables();
