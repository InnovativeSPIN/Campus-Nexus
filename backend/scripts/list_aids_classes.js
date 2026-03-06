import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Class } = models;

const findAllClasses = async () => {
    try {
        const classes = await Class.findAll({
            where: { department_id: 6 },
            raw: true
        });
        console.log(JSON.stringify(classes, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findAllClasses();
