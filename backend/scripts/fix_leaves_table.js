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

        // Show current leaves table columns
        const [cols] = await sequelize.query('DESCRIBE `leaves`');
        console.log('Current leaves columns:');
        cols.forEach(c => console.log(`  ${c.Field} (${c.Type}) null=${c.Null}`));

        const columnNames = cols.map(c => c.Field);

        // Add missing columns that the model defines but DB may not have
        const toAdd = [
            { name: 'reassign_faculty_id', sql: 'INT NULL COMMENT "Faculty ID who will cover during this leave"' },
            { name: 'documentUrl', sql: 'VARCHAR(255) NULL COMMENT "URL of uploaded supporting document"' },
            { name: 'loadAssign', sql: 'TEXT NULL COMMENT "Workload distribution details"' },
            { name: 'substitute_status', sql: "ENUM('pending','accepted','rejected') NULL" },
            { name: 'substitute_remarks', sql: 'TEXT NULL' },
            { name: 'substitute_response_at', sql: 'DATETIME NULL' },
        ];

        for (const col of toAdd) {
            if (!columnNames.includes(col.name)) {
                await sequelize.query(`ALTER TABLE \`leaves\` ADD COLUMN \`${col.name}\` ${col.sql}`);
                console.log(`✅ Added column: ${col.name}`);
            } else {
                console.log(`⏭  Column already exists: ${col.name}`);
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
