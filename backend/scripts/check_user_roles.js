import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'eduvertex',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    { host: process.env.MYSQL_HOST || 'localhost', dialect: 'mysql', logging: false }
);

(async () => {
    try {
        const [users] = await sequelize.query("SELECT Name, username, role FROM users WHERE username LIKE '%nscet.org%' OR Name LIKE '%mathalai%'");
        console.log('Users found:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
