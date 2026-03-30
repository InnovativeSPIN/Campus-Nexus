import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'eduvertex',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
  }
);

async function runMigration() {
  try {
    console.log('Starting migration: Add classId to portfolio tables...\n');

    // Add classId columns
    await sequelize.query(`ALTER TABLE student_sports ADD COLUMN IF NOT EXISTS classId INT NULL`);
    console.log('✓ Added classId to student_sports');

    await sequelize.query(`ALTER TABLE student_events ADD COLUMN IF NOT EXISTS classId INT NULL`);
    console.log('✓ Added classId to student_events');

    await sequelize.query(`ALTER TABLE student_certifications ADD COLUMN IF NOT EXISTS classId INT NULL`);
    console.log('✓ Added classId to student_certifications');

    await sequelize.query(`ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS classId INT NULL`);
    console.log('✓ Added classId to student_projects');

    // Populate classId from student table
    console.log('\nPopulating classId from existing student records...');
    
    await sequelize.query(`
      UPDATE student_sports ss 
      SET classId = (SELECT classId FROM student_profile s WHERE s.id = ss.studentId) 
      WHERE ss.classId IS NULL
    `);
    console.log('✓ Populated student_sports');

    await sequelize.query(`
      UPDATE student_events se 
      SET classId = (SELECT classId FROM student_profile s WHERE s.id = se.studentId) 
      WHERE se.classId IS NULL
    `);
    console.log('✓ Populated student_events');

    await sequelize.query(`
      UPDATE student_certifications sc 
      SET classId = (SELECT classId FROM student_profile s WHERE s.id = sc.studentId) 
      WHERE sc.classId IS NULL
    `);
    console.log('✓ Populated student_certifications');

    await sequelize.query(`
      UPDATE student_projects sp 
      SET classId = (SELECT classId FROM student_profile s WHERE s.id = sp.studentId) 
      WHERE sp.classId IS NULL
    `);
    console.log('✓ Populated student_projects');

    // Add indexes
    console.log('\nAdding indexes for performance...');
    
    try {
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_student_sports_classId ON student_sports(classId)`);
      console.log('✓ Created index on student_sports.classId');
    } catch (e) {
      if (!e.message.includes('Duplicate key')) throw e;
    }

    try {
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_student_events_classId ON student_events(classId)`);
      console.log('✓ Created index on student_events.classId');
    } catch (e) {
      if (!e.message.includes('Duplicate key')) throw e;
    }

    try {
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_student_certifications_classId ON student_certifications(classId)`);
      console.log('✓ Created index on student_certifications.classId');
    } catch (e) {
      if (!e.message.includes('Duplicate key')) throw e;
    }

    try {
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_student_projects_classId ON student_projects(classId)`);
      console.log('✓ Created index on student_projects.classId');
    } catch (e) {
      if (!e.message.includes('Duplicate key')) throw e;
    }

    console.log('\n✅ Migration completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();
