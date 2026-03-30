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

        // Check leave_notifications structure
        const [cols] = await sequelize.query('DESCRIBE `leave_notifications`');
        console.log('leave_notifications columns:');
        cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

        // Check existing notifications
        const [notifs] = await sequelize.query('SELECT * FROM `leave_notifications` ORDER BY id DESC LIMIT 10');
        console.log('\nExisting notifications:');
        notifs.forEach(n => console.log(JSON.stringify(n)));

        // Check leave id=4 details
        const [leaves] = await sequelize.query(
            'SELECT id, applicantId, leaveType, startDate, endDate, reason, loadAssign, reassign_faculty_id, substitute_status, departmentId FROM leaves WHERE id=4'
        );
        console.log('\nLeave id=4:', JSON.stringify(leaves[0]));

        // Get faculty names for applicant (406) and reassign (404)
        const [facs] = await sequelize.query(
            'SELECT faculty_id, Name FROM faculty_profiles WHERE faculty_id IN (404, 406)'
        );
        console.log('\nFaculty:', JSON.stringify(facs));

    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
