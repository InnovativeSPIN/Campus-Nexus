// Test endpoints after fixes
const baseUrl = 'http://localhost:8086/api/v1';

async function testWithAuth() {
  try {
    // Try student login
    console.log('🔓 Attempting student login...');
    const loginRes = await fetch(`${baseUrl}/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: '921023205024',
        password: 'Thanush@123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    
    if (loginData.success && loginData.data?.token) {
      const token = loginData.data.token;
      console.log('✅ Got token\n');
      
      // Test endpoints
      const endpoints = [
        '/students',
        '/departments',
        '/faculty'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Testing GET ${endpoint}...`);
          const res = await fetch(`${baseUrl}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`   Status: ${res.status}`);
          
          if (res.status === 200) {
            const data = await res.json();
            console.log(`   ✅ Success - ${Array.isArray(data.data) ? data.data.length : 'data'} items`);
          } else {
            const text = await res.text();
            console.log(`   ❌ Error: ${text.substring(0, 150)}`);
          }
        } catch (err) {
          console.log(`   ❌ Error: ${err.message}`);
        }
      }
    } else {
      console.log('❌ Login failed:', loginData.error);
      console.log('Trying with different password...');
      
      // Try without password or with empty
      const loginRes2 = await fetch(`${baseUrl}/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: '921023205024',
          password: ''
        })
      });
      
      const data2 = await loginRes2.json();
      console.log('Response:', data2);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testWithAuth();
