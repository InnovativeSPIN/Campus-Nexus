import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { StudentLeave } = models;

const findLeaves = async () => {
    try {
        const leaves = await StudentLeave.findAll({
            raw: true
        });
        console.log('Total leaves in table:', leaves.length);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

findLeaves();
