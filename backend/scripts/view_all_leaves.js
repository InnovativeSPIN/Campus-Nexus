import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { StudentLeave } = models;

const checkLeaves = async () => {
    try {
        const leaves = await StudentLeave.findAll({
            raw: true
        });
        console.log(JSON.stringify(leaves, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

checkLeaves();
