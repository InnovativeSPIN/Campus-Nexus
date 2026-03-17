
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { models, sequelize } from './backend/models/index.js';

async function test() {
  try {
    const leaves = await models.StudentLeave.findAll({ limit: 1 });
    console.log('Sample Leave Data:', JSON.stringify(leaves[0], null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
