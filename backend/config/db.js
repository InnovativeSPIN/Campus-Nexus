import colors from 'colors';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'eduvertex',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    // In development mode, synchronize models to ensure database schema matches code
    // This is useful when pulling new changes with column additions or model updates.
    if (process.env.NODE_ENV === 'development') {
        console.log('Synchronizing database models...'.yellow);
        await sequelize.sync({ alter: true }).then(() => {
            console.log('Database synchronization complete.'.green);
        }).catch(err => {
            console.error('Database sync warning (continuing):'.yellow, err.message);
        });
    }

    console.log(
      `MySQL Connected: ${sequelize.config.host}`.cyan.underline.bold
    );
  } catch (error) {
    console.error(`MySQL connection error: ${error.message}`.red);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
