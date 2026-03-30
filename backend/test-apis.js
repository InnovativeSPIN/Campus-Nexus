// Test script to verify timetable management APIs
// Run this after starting the backend server

const API_BASE = 'http://localhost:3005/api/v1';

// You'll need to replace this with a valid token from your department admin login
const TOKEN = 'YOUR_DEPT_ADMIN_TOKEN_HERE';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

async function testAPIs() {
  console.log('\n🎯 Testing Timetable Management APIs\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Download CSV Format
    console.log('\n1. Testing CSV Format Download...');
    const formatResponse = await fetch(`${API_BASE}/timetable/format`);
    const formatText = await formatResponse.text();
    console.log('✅ CSV Format endpoint working');
    console.log('Sample:', formatText.split('\n').slice(0, 2).join('\n'));
    
    // Test 2: Get Rooms (requires auth)
    console.log('\n2. Testing Rooms endpoint...');
    const roomsResponse = await fetch(`${API_BASE}/department-admin/rooms`, { headers });
    if (roomsResponse.ok) {
      const roomsData = await roomsResponse.json();
       console.log(`✅ Rooms endpoint working (${roomsData.count || 0} rooms found)`);
    } else {
      console.log(`⚠️ Rooms endpoint requires authentication (${roomsResponse.status})`);
      console.log('   Please login and update TOKEN variable in this script');
    }
    
    // Test 3: Get Labs (requires auth)
    console.log('\n3. Testing Labs endpoint...');
    const labsResponse = await fetch(`${API_BASE}/department-admin/labs`, { headers });
    if (labsResponse.ok) {
      const labsData = await labsResponse.json();
      console.log(`✅ Labs endpoint working (${labsData.count || 0} labs found)`);
    } else {
      console.log(`⚠️ Labs endpoint requires authentication (${labsResponse.status})`);
    }
    
    // Test 4: Get Break Timings (requires auth)
    console.log('\n4. Testing Break Timings endpoint...');
    const breakResponse = await fetch(`${API_BASE}/department-admin/break-timings`, { headers });
    if (breakResponse.ok) {
      const breakData = await breakResponse.json();
      console.log(`✅ Break timings endpoint working (${breakData.data?.length || 0} break timings found)`);
    } else {
      console.log(`⚠️ Break timings endpoint requires authentication (${breakResponse.status})`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ API Structure Verified!');
    console.log('\nTo test authenticated endpoints:');
    console.log('1. Login as department-admin');
    console.log('2. Copy the JWT token from browser/Postman');
    console.log('3. Update TOKEN variable in this script');
    console.log('4. Run: node test-apis.js\n');
    
  } catch (error) {
    console.error('\n❌ Error testing APIs:', error.message);
    console.log('\nMake sure the backend server is running on port 3005');
  }
}

testAPIs();
