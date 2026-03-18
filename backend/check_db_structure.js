import { sequelize } from './config/db.js';

const checkTable = async () => {
    try {
        const [results] = await sequelize.query("DESCRIBE student_leaves");
        console.log("TABLE STRUCTURE FOR student_leaves:");
        console.table(results);
        process.exit(0);
    } catch (error) {
        console.error("ERROR DESCRIBING TABLE:", error.message);
        process.exit(1);
    }
};

checkTable();
