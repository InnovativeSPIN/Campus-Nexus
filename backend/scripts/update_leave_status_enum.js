import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'eduvertex',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    { host: process.env.MYSQL_HOST || 'localhost', dialect: 'mysql', logging: false }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected\n');

        // Update status ENUM in leaves table
        await sequelize.query(`
      ALTER TABLE \`leaves\` MODIFY COLUMN \`status\` 
      ENUM('pending', 'hod_approved', 'approved', 'rejected', 'cancelled') 
      NOT NULL DEFAULT 'pending'
    `);
        console.log('✅ Updated status ENUM in leaves table');

        console.log('\nDone.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
