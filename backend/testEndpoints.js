// Test the endpoints that are failing with 500 errors
const baseUrl = 'http://localhost:8086/api/v1';

// Dummy token (just for testing if endpoints are even being hit)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIn0.TBOP9W0OhSd_2zTkSm83PiwGKzmQiTt1Bw6STQjG3fE';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    
    console.log(`   Status: ${res.status}`);
    const text = await res.text();
    
    if (res.status !== 200) {
      console.log(`   ❌ Error Response:`, text.substring(0, 300));
    } else {
      console.log(`   ✅ Success. Data length: ${text.length}`);
      console.log(`   Data preview:`, text.substring(0, 200));
    }
  } catch (err) {
    console.error(`   ❌ Error:`, err.message);
  }
}

(async () => {
  console.log('=== TESTING FAILING ENDPOINTS ===');
  
  await testEndpoint('GET /students', `${baseUrl}/students`);
  await testEndpoint('GET /departments', `${baseUrl}/departments`);
  await testEndpoint('GET /faculty', `${baseUrl}/faculty`);
  await testEndpoint('GET /auth/student-details/921023205024', `${baseUrl}/auth/student-details/921023205024`);
  
  console.log('\n✅ Test complete');
})();
