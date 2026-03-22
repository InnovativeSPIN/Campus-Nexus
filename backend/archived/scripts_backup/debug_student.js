import dotenv from 'dotenv';
dotenv.config();

import { sequelize, models } from '../models/index.js';
const { Class } = models;

const debug = async () => {
    try {
        const classes = await Class.findAll({
            where: { department_id: 6 },
            raw: true
        });
        console.log('Classes in Dept 6:', JSON.stringify(classes, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debug();
