import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { Leave } = models;
import { Op } from 'sequelize';

const checkPending = async () => {
    try {
        const leaves = await Leave.findAll({
            where: {
                departmentId: 6,
                status: 'pending',
                [Op.or]: [
                    { reassign_faculty_id: null },
                    { substitute_status: 'accepted' }
                ]
            }
        });
        console.log(JSON.stringify(leaves, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPending();
