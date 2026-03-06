import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'eduvertex',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
        dialect: 'mysql',
        logging: false
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected\n');

        // Revert the 40 batch="2025-2029" students that were wrongly moved
        // from semester=5 to semester=6. Put them back to semester=5, year=3.
        const [result] = await sequelize.query(
            `UPDATE student_profile 
       SET semester = 5, year = 3 
       WHERE departmentId = 6 AND semester = 6 AND batch = '2025-2029'`
        );
        console.log(`Reverted ${result.affectedRows} students: batch=2025-2029, semester 6 → 5`);

        // Verify final distribution
        const [dist] = await sequelize.query(
            `SELECT batch, semester, year, COUNT(*) as count 
       FROM student_profile 
       WHERE departmentId = 6 
       GROUP BY batch, semester, year 
       ORDER BY batch, semester`
        );
        console.log('\nFinal AI&DS student distribution:');
        dist.forEach(r =>
            console.log(`  batch="${r.batch}" semester=${r.semester} year=${r.year} count=${r.count}`)
        );

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
