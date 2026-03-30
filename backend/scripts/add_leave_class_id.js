import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

const runMigration = async () => {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'eduvertex',
        port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    });

    try {
        console.log('Adding classId column to student_leaves table...');
        await connection.query('ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS classId INT NULL AFTER studentId;');
        console.log('Column added successfully (or already existed).');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
};

runMigration();
