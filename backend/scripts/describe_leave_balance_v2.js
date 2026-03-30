import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';

const describeTable = async () => {
    try {
        const [results] = await sequelize.query('DESCRIBE leave_balance');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

describeTable();
