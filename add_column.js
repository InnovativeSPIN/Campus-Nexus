import { sequelize } from './backend/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function addColumn() {
  try {
    await sequelize.query("ALTER TABLE student_leaves ADD COLUMN submitted_to ENUM('Class Incharge', 'Faculty Advisor', 'HOD') DEFAULT 'Class Incharge' AFTER overall_status;");
    console.log('Column submitted_to added successfully');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('Column already exists');
      process.exit(0);
    }
    console.error('Error adding column:', error.message);
    process.exit(1);
  }
}

addColumn();
