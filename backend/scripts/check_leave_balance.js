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

        // Show leave_balance table structure
        const [cols] = await sequelize.query("DESCRIBE `leave_balance`");
        console.log('leave_balance columns:');
        cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

        // Show actual data
        const [rows] = await sequelize.query("SELECT * FROM `leave_balance` LIMIT 5");
        console.log('\nleave_balance data:');
        rows.forEach(r => console.log(JSON.stringify(r)));

        // Show staff_leave_balance table structure
        const [cols2] = await sequelize.query("DESCRIBE `staff_leave_balance`").catch(() => [[]]);
        if (cols2.length) {
            console.log('\nstaff_leave_balance columns:');
            cols2.forEach(c => console.log(`  ${c.Field} (${c.Type})`));
            const [rows2] = await sequelize.query("SELECT * FROM `staff_leave_balance` LIMIT 5");
            console.log('\nstaff_leave_balance data:');
            rows2.forEach(r => console.log(JSON.stringify(r)));
        }

        // Show faculty user IDs for cross-reference
        const [faculty] = await sequelize.query("SELECT faculty_id, Name FROM faculty_profile LIMIT 5");
        console.log('\nFaculty records:');
        faculty.forEach(f => console.log(`  faculty_id=${f.faculty_id} name="${f.Name}"`));

    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
