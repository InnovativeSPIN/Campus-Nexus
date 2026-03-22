import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Class } = models;
import { Op } from 'sequelize';

const findAllClasses = async () => {
    try {
        const classes = await Class.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: '%II %' } },
                    { name: { [Op.like]: '%second%' } }
                ]
            },
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
