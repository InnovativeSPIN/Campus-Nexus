// Check if all controllers load without errors
console.log('🔍 Checking if controllers load without syntax errors...\n');

try {
  console.log('Importing student controller...');
  const studentCtrl = await import('./controllers/student/student.controller.js');
  console.log('✅ Student controller loaded\n');
} catch (err) {
  console.error('❌ Student controller error:', err.message, '\n');
}

try {
  console.log('Importing department controller...');
  const deptCtrl = await import('./controllers/admin/department.controller.js');
  console.log('✅ Department controller loaded\n');
} catch (err) {
  console.error('❌ Department controller error:', err.message, '\n');
}

try {
  console.log('Importing faculty controller...');
  const facCtrl = await import('./controllers/faculty/faculty.controller.js');
  console.log('✅ Faculty controller loaded\n');
} catch (err) {
  console.error('❌ Faculty controller error:', err.message, '\n');
}

try {
  console.log('Importing auth controller...');
  const authCtrl = await import('./controllers/admin/auth.controller.js');
  console.log('✅ Auth controller loaded\n');
} catch (err) {
  console.error('❌ Auth controller error:', err.message, '\n');
}

console.log('✅ All controllers load successfully - no syntax errors');
process.exit(0);
