import colors from "colors";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    dialect: "mysql",
    logging: false,
    // Connection pool settings to prevent exhaustion and hangs
    pool: {
      max: 10,           // Maximum number of connections in the pool
      min: 0,            // Don't create connections until needed (was causing startup timeout)
      acquire: 90000,    // Max time in ms for acquiring a connection (90 seconds)
      idle: 20000,       // Max time ms connection can be idle before being released (20 seconds)
      evict: 60000,      // Check every 60 seconds for idle connections to evict
      handleDisconnects: true  // Handle disconnections automatically
    },
    // Connection retry logic for remote servers
    retry: {
      max: 10,           // Retry 10 times on connection failure
      timeout: 15000     // Wait 15 seconds between retries
    },
    // MySQL connection timeout
    connectTimeout: 90000  // 90 second initial connection timeout
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected`.cyan.bold);
  } catch (error) {
    console.error(`Database Error: ${error.message}`.red.bold);
    console.error(error);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;