import { sequelize } from './backend/config/db.js';

async function updateSchema() {
    try {
        console.log('Relaxing constraints on faculy_edu_qualification table...');

        // Disable foreign key checks
        await sequelize.query(`SET FOREIGN_KEY_CHECKS = 0;`);

        // Make education fields nullable
        await sequelize.query(`ALTER TABLE faculy_edu_qualification MODIFY COLUMN degree VARCHAR(100) NULL;`);
        await sequelize.query(`ALTER TABLE faculy_edu_qualification MODIFY COLUMN branch VARCHAR(150) NULL;`);
        await sequelize.query(`ALTER TABLE faculy_edu_qualification MODIFY COLUMN university VARCHAR(255) NULL;`);
        await sequelize.query(`ALTER TABLE faculy_edu_qualification MODIFY COLUMN college VARCHAR(255) NULL;`);

        console.log('Relaxing constraints on faculty_experience table...');
        await sequelize.query(`ALTER TABLE faculty_experience MODIFY COLUMN designation VARCHAR(100) NULL;`);
        await sequelize.query(`ALTER TABLE faculty_experience MODIFY COLUMN institution_name VARCHAR(255) NULL;`);
        await sequelize.query(`ALTER TABLE faculty_experience MODIFY COLUMN university VARCHAR(255) NULL;`);
        await sequelize.query(`ALTER TABLE faculty_experience MODIFY COLUMN job_title VARCHAR(150) NULL;`);
        await sequelize.query(`ALTER TABLE faculty_experience MODIFY COLUMN company VARCHAR(255) NULL;`);

        // Re-enable foreign key checks
        await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1;`);

        console.log('Database constraints relaxed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating database:', error);
        try {
            await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1;`);
        } catch { }
        process.exit(1);
    }
}

updateSchema();
