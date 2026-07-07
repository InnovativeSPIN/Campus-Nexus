import { sequelize } from './models/index.js';

async function test() {
  try {
    const [results] = await sequelize.query("SHOW COLUMNS FROM leave_notifications_v2 WHERE Field = 'notification_type'");
    console.log(results);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

test();
