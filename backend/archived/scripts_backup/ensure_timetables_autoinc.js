import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/db.js';
import { QueryTypes } from 'sequelize';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    // check the column definition for timetables.id
    const result = await sequelize.query(
      "SHOW CREATE TABLE timetables;",
      { type: QueryTypes.SELECT }
    );

    const ddl = result[0]['Create Table'];
    console.log('Current timetables DDL:', ddl);

    if (/AUTO_INCREMENT/.test(ddl)) {
      console.log('✓ timetables.id already has AUTO_INCREMENT');
      process.exit(0);
    }

    // Check for existing data and NULL ids
    const rows = await sequelize.query(
      'SELECT COUNT(*) as cnt, COUNT(DISTINCT id) as uniq FROM timetables;',
      { type: QueryTypes.SELECT }
    );
    const { cnt, uniq } = rows[0];
    console.log(`Table has ${cnt} rows, ${uniq} unique ids`);

    // Check if there are NULL or duplicate IDs that would cause AUTO_INCREMENT issues
    const hasNullIds = cnt > uniq;
    
    if (hasNullIds) {
      console.log('⚠️  Table has NULL or duplicate IDs. Attempting to fix...');
      // Find max existing ID and set AUTO_INCREMENT to max+1
      const maxIdResult = await sequelize.query(
        'SELECT MAX(id) as maxId FROM timetables;',
        { type: QueryTypes.SELECT }
      );
      const maxId = maxIdResult[0].maxId || 0;
      const newAutoInc = maxId + 1;
      console.log(`Setting AUTO_INCREMENT to ${newAutoInc}`);
      await sequelize.query(
        `ALTER TABLE timetables MODIFY id INT NOT NULL AUTO_INCREMENT = ${newAutoInc};`
      );
      console.log('✓ AUTO_INCREMENT fixed without data loss!');
    } else {
      // No data issues - just add AUTO_INCREMENT
      console.log('Adding AUTO_INCREMENT to timetables.id...');
      await sequelize.query(
        'ALTER TABLE timetables MODIFY id INT NOT NULL AUTO_INCREMENT;'
      );
      console.log('✓ AUTO_INCREMENT added successfully.');
    }

    process.exit(0);
  } catch (err) {
    console.error('✗ Error ensuring autoincrement:', err.message || err);
    console.error('Full error:', err);
    process.exit(1);
  }
}

run();
