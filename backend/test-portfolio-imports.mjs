console.log('[TEST] 1. Before studentMarks import');
try {
  const studentMarksRoutes = await import('./routes/student/studentMarks.routes.js');
  console.log('[TEST] studentMarks import SUCCESS');
} catch (e) {
  console.error('[TEST] studentMarks import FAILED:', e.message);
}

console.log('[TEST] 2. Before studentProject import');
try {
  const studentProjectRoutes = await import('./routes/student/studentProject.routes.js');
  console.log('[TEST] studentProject import SUCCESS');
} catch (e) {
  console.error('[TEST] studentProject import FAILED:', e.message);
}

console.log('[TEST] 3. Before studentCertification import');
try {
  const studentCertificationRoutes = await import('./routes/student/studentCertification.routes.js');
  console.log('[TEST] studentCertification import SUCCESS');
} catch (e) {
  console.error('[TEST] studentCertification import FAILED:', e.message);
}

console.log('[TEST] All imports completed');
process.exit(0);
