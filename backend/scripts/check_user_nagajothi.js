import dotenv from 'dotenv';
dotenv.config();
import { models } from '../models/index.js';
const { User, Faculty } = models;

const checkUser = async () => {
    try {
        const faculty = await Faculty.findByPk(406);
        console.log('Faculty email:', faculty.email);

        const user = await User.findOne({ where: { email: faculty.email } });
        console.log('User Record:', JSON.stringify(user, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
