import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const restoreDatabase = async () => {
  try {
    console.log('🔄 Starting database restore...\n');

    // Read the SQL backup file
    const sqlFilePath = path.join(__dirname, 'db_backup', 'eduvertex.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split the SQL file into individual statements
    // Remove comments and empty lines
    const statements = sqlContent
      .split(';')
      .map(s => {
        // Remove comments
        return s
          .replace(/--.*$/gm, '') // Remove line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .trim();
      })
      .filter(s => s.length > 0 && !s.startsWith('/*!'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let executed = 0;
    let skipped = 0;

    for (const statement of statements) {
      try {
        // Skip SET statements that may cause issues
        if (statement.startsWith('SET ') && !statement.includes('CREATE') && !statement.includes('ALTER')) {
          skipped++;
          continue;
        }

        // Execute the statement
        await sequelize.query(statement, { raw: true });
        executed++;

        if (executed % 10 === 0) {
          process.stdout.write(`✓ ${executed} statements executed\r`);
        }
      } catch (err) {
        // Log error but continue
        if (err.message && err.message.includes('already exists')) {
          skipped++;
        } else if (err.message && err.message.includes("doesn't exist")) {
          // Skip drop table errors
          skipped++;
        } else {
          console.error(`\n❌ Error executing statement:`, err.message.substring(0, 100));
          // Don't throw, continue with next statement
        }
      }
    }

    console.log(`\n\n✅ Database restore completed!`);
    console.log(`  ✓ Executed: ${executed} statements`);
    console.log(`  ⊘ Skipped: ${skipped} statements`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring database:', error.message);
    process.exit(1);
  }
};

restoreDatabase();
