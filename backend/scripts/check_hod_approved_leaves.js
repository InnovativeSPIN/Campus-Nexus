import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'eduvertex',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    { host: process.env.MYSQL_HOST || 'localhost', dialect: 'mysql', logging: false }
);

(async () => {
    try {
        const [leaves] = await sequelize.query("SELECT id, applicantId, status, approvedById FROM leaves WHERE status = 'hod_approved'");
        console.log('Leaves with status hod_approved:', JSON.stringify(leaves, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
