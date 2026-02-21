(async () => {
  try {
    const res = await fetch('http://localhost:8086/api/v1/health');
    console.log('health:', res.status, await res.text());
  } catch (err) {
    console.error('health error', err.message);
  }

  try {
    const res = await fetch('http://localhost:8086/api/v1/auth/student-details/921023205024');
    console.log('student-details:', res.status);
    const text = await res.text();
    console.log(text.substring(0, 100));
  } catch (err) {
    console.error('student-details error', err.message);
  }
})();