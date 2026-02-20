import { sequelize } from './config/db.js';
import colors from 'colors';

const setupUsersTable = async () => {
  try {
    console.log('Starting users table setup...'.cyan);

    // Check if users table exists
    const tables = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.MYSQL_DATABASE || 'eduvertex'}' 
      AND TABLE_NAME = 'users'
    `);

    if (tables[0].length > 0) {
      console.log('Users table already exists. Checking schema...'.yellow);
      
      // Check if role_id column exists
      const columns = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.MYSQL_DATABASE || 'eduvertex'}' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'role_id'
      `);

      if (columns[0].length === 0) {
        console.log('Migration needed: Adding role_id column...'.yellow);
        await sequelize.query(`
          ALTER TABLE users ADD COLUMN role_id INT(11) NOT NULL DEFAULT 1
        `);
        await sequelize.query(`
          ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(role_id)
        `);
        // Drop old role column if it exists
        try {
          await sequelize.query(`ALTER TABLE users DROP COLUMN role`);
          console.log('Removed old role column'.green);
        } catch (e) {
          // Column might not exist, that's ok
        }
        console.log('Schema migration completed'.green);
      }

      // Check if avatar column exists
      const avatarColumns = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.MYSQL_DATABASE || 'eduvertex'}' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'avatar'
      `);

      if (avatarColumns[0].length === 0) {
        console.log('Adding avatar column...'.yellow);
        await sequelize.query(`
          ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL
        `);
        console.log('Avatar column added'.green);
      }

      console.log('Users table is ready'.green.bold);
      return;
    }

    // Create users table if it doesn't exist
    console.log('Creating users table...'.cyan);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT(11) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        isActive TINYINT(1) DEFAULT 1,
        avatar VARCHAR(255) DEFAULT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY email (email),
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log('Users table created successfully'.green.bold);
  } catch (error) {
    console.error(`Error setting up users table: ${error.message}`.red);
    throw error;
  }
};

// Run the setup
setupUsersTable()
  .then(() => {
    console.log('Users table setup completed successfully'.green.bold);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Users table setup failed'.red.bold);
    process.exit(1);
  });
