import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'eduvertex'
    });

    console.log('Running Portfolio Notifications Migration...\n');

    // Read the SQL file
    const sqlFile = path.join(process.cwd(), 'migrations', '101-create-portfolio-notifications.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Remove comments and split by statements
    const lines = sql.split('\n');
    const statements = [];
    let currentStatement = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comment-only lines
      if (trimmed.startsWith('--') || trimmed === '') {
        continue;
      }
      
      currentStatement += ' ' + line;
      
      // If line ends with semicolon, it's complete statement
      if (trimmed.endsWith(';')) {
        const statement = currentStatement.trim();
        if (statement.length > 0 && !statement.startsWith('--')) {
          statements.push(statement);
        }
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const preview = statement.substring(0, 70).replace(/\n/g, ' ');
        console.log(`[${i+1}/${statements.length}] ${preview}...`);
        await connection.query(statement);
        console.log('✅ Success\n');
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY' || err.message.includes('already exists')) {
          console.log('⚠️  Skipped (already exists)\n');
        } else if (err.code === 'ER_NO_SUCH_TABLE' && statement.includes('ALTER TABLE')) {
          console.log('⚠️  Skipped (source table does not exist)\n');
        } else if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  Skipped (column already exists)\n');
        } else if (err.code === 'ER_NO_SUCH_TABLE' && statement.includes('INSERT INTO')) {
          console.log('⚠️  Skipped (destination table does not exist - will retry after all CREATE TABLE statements)\n');
        } else {
          console.error(`❌ Error in statement [${i+1}]:`);
          console.error(err.message);
          throw err;
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

runMigration();
