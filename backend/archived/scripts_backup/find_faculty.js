import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Faculty } = models;
import { Op } from 'sequelize';

const findFaculty = async () => {
    try {
        const f = await Faculty.findOne({
            where: {
                Name: { [Op.like]: '%VIGNESH%' }
            }
        });
        if (f) {
            console.log(JSON.stringify(f.toJSON(), null, 2));
        } else {
            console.log('Faculty not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findFaculty();
