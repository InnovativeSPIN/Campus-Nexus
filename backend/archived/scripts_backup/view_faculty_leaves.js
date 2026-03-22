import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';

const viewFacultyLeaves = async () => {
    try {
        const [results] = await sequelize.query(`
            SELECT l.*, f.Name as applicantName 
            FROM leaves l
            JOIN faculty_profiles f ON l.applicantId = f.faculty_id
            ORDER BY l.createdAt DESC
        `);
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

viewFacultyLeaves();
