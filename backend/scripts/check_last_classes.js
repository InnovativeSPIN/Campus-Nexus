import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Class } = models;

const check = async () => {
    try {
        const classes = await Class.findAll({
            order: [['id', 'DESC']],
            limit: 5,
            raw: true
        });
        console.log(JSON.stringify(classes, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

check();
