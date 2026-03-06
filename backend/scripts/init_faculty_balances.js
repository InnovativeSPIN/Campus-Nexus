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

        const facultyToInit = [404, 406]; // VINOTH and NAGAJOTHI
        const academicYear = new Date().getFullYear().toString();
        const defaultData = JSON.stringify({ balance: 10, used: 0 });
        const defaultCasual = JSON.stringify({ balance: 12, used: 0 });
        const defaultEarned = JSON.stringify({ balance: 15, used: 0 });
        const defaultPersonal = JSON.stringify({ balance: 5, used: 0 });
        const defaultMaternity = JSON.stringify({ balance: 90, used: 0 });
        const defaultOnDuty = JSON.stringify({ balance: 10, used: 0 });
        const defaultCompOff = JSON.stringify({ balance: 0, used: 0 });

        for (const facultyId of facultyToInit) {
            const [existing] = await sequelize.query(
                'SELECT id FROM leave_balance WHERE userId = ? AND academicYear = ?',
                { replacements: [facultyId, academicYear] }
            );

            if (existing.length === 0) {
                await sequelize.query(`
          INSERT INTO leave_balance 
          (userId, userType, academicYear, Medical, Casual, Earned, \`On-Duty\`, Personal, Maternity, \`Comp-Off\`, createdAt, updatedAt)
          VALUES (?, 'faculty', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, {
                    replacements: [
                        facultyId, academicYear,
                        defaultData, defaultCasual, defaultEarned, defaultOnDuty,
                        defaultPersonal, defaultMaternity, defaultCompOff
                    ]
                });
                console.log(`✅ Initialized leave balance for faculty_id ${facultyId}`);
            } else {
                console.log(`⏭  Balance record already exists for faculty_id ${facultyId}`);
            }
        }

        console.log('\nDone.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
