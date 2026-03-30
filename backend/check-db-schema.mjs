import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('eduvertex', 'root', 'Nscet@123', {
  host: '210.212.252.101',
  dialect: 'mysql',
  logging: false
});

async function checkColumns() {
  try {
    console.log('\n=== Checking Database Columns ===\n');

    // Check student_certifications
    const certTable = await sequelize.queryInterface.describeTable('student_certifications');
    console.log('[student_certifications]');
    console.log('Columns:', Object.keys(certTable).join(', '));
    console.log('✓ classId:', 'classId' in certTable ? 'EXISTS' : 'MISSING');
    console.log('✓ approvalStatus:', 'approvalStatus' in certTable ? 'EXISTS' : 'MISSING');

    // Check student_projects
    const projTable = await sequelize.queryInterface.describeTable('student_projects');
    console.log('\n[student_projects]');
    console.log('Columns:', Object.keys(projTable).join(', '));
    console.log('✓ classId:', 'classId' in projTable ? 'EXISTS' : 'MISSING');
    console.log('✓ approvalStatus:', 'approvalStatus' in projTable ? 'EXISTS' : 'MISSING');

    // Check student_sports
    const sportsTable = await sequelize.queryInterface.describeTable('student_sports');
    console.log('\n[student_sports]');
    console.log('Columns:', Object.keys(sportsTable).join(', '));
    console.log('✓ classId:', 'classId' in sportsTable ? 'EXISTS' : 'MISSING');
    console.log('✓ approvalStatus:', 'approvalStatus' in sportsTable ? 'EXISTS' : 'MISSING');

    // Check student_events
    const eventsTable = await sequelize.queryInterface.describeTable('student_events');
    console.log('\n[student_events]');
    console.log('Columns:', Object.keys(eventsTable).join(', '));
    console.log('✓ classId:', 'classId' in eventsTable ? 'EXISTS' : 'MISSING');
    console.log('✓ approvalStatus:', 'approvalStatus' in eventsTable ? 'EXISTS' : 'MISSING');

    console.log('\n✓ Database schema verification complete\n');
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

checkColumns();
