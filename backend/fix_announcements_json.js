import { sequelize } from './config/db.js';

const fixAnnouncements = async () => {
    try {
        console.log("Checking targetRole column type...");
        // On some DBs, casting might be needed or column type fixed
        console.log("Modifying targetRole to JSON type...");
        await sequelize.query("ALTER TABLE announcements MODIFY COLUMN targetRole JSON NOT NULL");
        
        console.log("Modifying attachments to JSON type...");
        await sequelize.query("ALTER TABLE announcements MODIFY COLUMN attachments JSON");

        console.log("ANNOUNCEMENTS TABLE FIXED!");
        process.exit(0);
    } catch (error) {
        console.error("ERROR FIXING ANNOUNCEMENTS TABLE:", error.message);
        // If JSON type is not supported, we should fall back to string searching in the controller
        process.exit(1);
    }
};

fixAnnouncements();
