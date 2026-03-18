import { Sequelize } from 'sequelize';

const seq = new Sequelize('eduvertex', 'root', '', { 
  host: '127.0.0.1', dialect: 'mysql', logging: false 
});

try {
  const [cols] = await seq.query('DESCRIBE users');
  console.log('USERS COLUMNS:', cols.map(c => c.Field));
  
  const [users] = await seq.query('SELECT id, email FROM users LIMIT 5');
  console.log('USERS:', JSON.stringify(users, null, 2));

  const [profiles] = await seq.query('SELECT id, userId, firstName, classId, departmentId FROM student_profile LIMIT 3');
  console.log('PROFILES:', JSON.stringify(profiles, null, 2));
} catch(e) {
  console.error(e.message);
}
process.exit(0);
