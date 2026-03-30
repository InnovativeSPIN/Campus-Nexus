// Test if the portfolio route imports work
console.log('Starting import tests...');

try {
    console.log('\n[1] Testing studentMarks import...');
    const studentMarksRoutes = await import('./routes/student/studentMarks.routes.js');
    console.log('✓ studentMarks imported successfully');
} catch (err) {
    console.error('✗ studentMarks failed:', err.message);
}

try {
    console.log('\n[2] Testing studentProject import...');
    const studentProjectRoutes = await import('./routes/student/studentProject.routes.js');
    console.log('✓ studentProject imported successfully');
} catch (err) {
    console.error('✗ studentProject failed:', err.message);
}

try {
    console.log('\n[3] Testing studentCertification import...');
    const studentCertificationRoutes = await import('./routes/student/studentCertification.routes.js');
    console.log('✓ studentCertification imported successfully');
} catch (err) {
    console.error('✗ studentCertification failed:', err.message);
}

try {
    console.log('\n[4] Testing studentExtracurricular import...');
    const studentExtracurricularRoutes = await import('./routes/student/studentExtracurricular.routes.js');
    console.log('✓ studentExtracurricular imported successfully');
} catch (err) {
    console.error('✗ studentExtracurricular failed:', err.message);
}

console.log('\n✓ All tests completed');
process.exit(0);
