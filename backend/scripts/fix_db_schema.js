import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';

const fixDB = async () => {
    try {
        console.log('--- FIXING DATABASE SCHEMA ---');

        // 1. Check if the constraint exists
        const [results] = await sequelize.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.key_column_usage 
            WHERE TABLE_NAME = 'student_leaves' 
            AND COLUMN_NAME = 'approvedById'
        `);

        for (const row of results) {
            console.log(`Dropping constraint: ${row.CONSTRAINT_NAME}`);
            await sequelize.query(`ALTER TABLE student_leaves DROP FOREIGN KEY ${row.CONSTRAINT_NAME};`);
        }

        // 2. Add the correct foreign key pointing to faculty_profiles
        console.log('Adding correct foreign key pointing to faculty_profiles...');
        await sequelize.query(`
            ALTER TABLE student_leaves 
            ADD CONSTRAINT fk_student_leave_approver_faculty 
            FOREIGN KEY (approvedById) REFERENCES faculty_profiles(faculty_id)
            ON DELETE SET NULL ON UPDATE CASCADE;
        `);

        console.log('--- DATABASE SCHEMA FIXED ---');
        process.exit(0);
    } catch (err) {
        console.error('ERROR FIXING DB:', err);
        process.exit(1);
    }
};

fixDB();
