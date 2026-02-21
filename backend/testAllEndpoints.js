// Test all three failing endpoints
const baseUrl = 'http://localhost:8086/api/v1';

// Test endpoint with a valid token (students can be accessed without one on public endpoints)
async function testEndpoint(name, url) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log(`   Status: ${res.status}`);
    
    if (res.status === 200) {
      const data = await res.json();
      if (data.success) {
        const dataCount = Array.isArray(data.data) ? data.data.length : (data.data ? 1 : 0);
        console.log(`   ✅ SUCCESS - ${dataCount} items returned\n`);
        if (Array.isArray(data.data) && data.data.length > 0) {
          const first = data.data[0];
          const keys = Object.keys(first).slice(0, 3);
          console.log(`   Sample fields: ${keys.join(', ')}`);
        }
      } else {
        console.log(`   ⚠️  ${data.error || 'Unknown error'}`);
      }
    } else if (res.status === 401 || res.status === 403) {
      console.log(`   ⚠️  Authentication required - status ${res.status}`);
    } else {
      const text = await res.text();
      console.log(`   ❌ Error - ${text.substring(0, 200)}`);
    }
  } catch (err) {
    console.error(`   ❌ Network error: ${err.message}`);
  }
}

async function runTests() {
  console.log('=== TESTING FIXED ENDPOINTS ===');
  
  await testEndpoint('GET /students', `${baseUrl}/students`);
  await testEndpoint('GET /departments', `${baseUrl}/departments`);
  await testEndpoint('GET /faculty', `${baseUrl}/faculty`);
  
  console.log('\n✅ All endpoint tests complete');
}

runTests();
