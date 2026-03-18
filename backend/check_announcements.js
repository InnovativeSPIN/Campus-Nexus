import { sequelize } from './config/db.js';

const checkAnnouncements = async () => {
    try {
        const [results] = await sequelize.query("DESCRIBE announcements");
        console.log("TABLE STRUCTURE FOR announcements:");
        console.table(results);
        process.exit(0);
    } catch (error) {
        console.error("ERROR DESCRIBING TABLE:", error.message);
        process.exit(1);
    }
};

checkAnnouncements();
