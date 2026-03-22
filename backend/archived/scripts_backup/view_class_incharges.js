import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';

const viewClassIncharges = async () => {
    try {
        const [results] = await sequelize.query('SELECT ci.*, c.name as className, c.batch FROM class_incharges ci JOIN classes c ON ci.class_id = c.id');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

viewClassIncharges();
