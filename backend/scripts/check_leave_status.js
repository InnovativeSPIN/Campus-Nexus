import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { StudentLeave } = models;

const checkStatus = async () => {
    try {
        const description = await StudentLeave.describe();
        console.log('Status Column Description:', JSON.stringify(description.status, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStatus();
