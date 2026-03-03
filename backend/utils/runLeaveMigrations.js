import fs from 'fs';
import path from 'path';
import { sequelize } from '../config/db.js';

/**
 * Run all migration files to set up the leaves and leave_balance tables
 */
async function runLeaveMigrations() {
  try {
    console.log('Starting leave migration...');

    // Read and execute leaves table migration
    const leavesSQL = fs.readFileSync(
      path.join(import.meta.url, '../../migrations/009_create_leaves_table.sql'),
      'utf8'
    );
    
    // Split by semicolon and execute each statement
    const leaveStatements = leavesSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of leaveStatements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sequelize.query(statement);
      }
    }

    console.log('✓ Leaves table created successfully');

    // Read and execute leave_balance table migration
    const balanceSQL = fs.readFileSync(
      path.join(import.meta.url, '../../migrations/010_create_leave_balance_table.sql'),
      'utf8'
    );
    
    const balanceStatements = balanceSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of balanceStatements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sequelize.query(statement);
      }
    }

    console.log('✓ Leave balance table created successfully');
    console.log('✓ All leave migrations completed!');

    // Verify tables were created
    const tables = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('leaves', 'leave_balance')
    `);
    
    console.log('✓ Created tables:', tables[0].map(t => t.TABLE_NAME).join(', '));

  } catch (error) {
    console.error('Error running leave migrations:', error);
    process.exit(1);
  }
}

export default runLeaveMigrations;
