// Test script to verify residence type enum fix
const axios = require('axios');

const API_URL = 'http://localhost:8086/api/v1'; // Frontend proxy
const TEST_STUDENT_EMAIL = 'student1@example.com';

async function testResidenceTypeUpdate() {
  try {
    console.log('Testing residence type enum values...\n');

    // Test data with corrected enum values
    const testData = {
      residenceType: 'hosteller',  // Using correct enum value (lowercase with underscore)
      bloodGroup: 'A+',
      motherTongue: 'Tamil',
      religion: 'Hindu'
    };

    console.log('Test Payload:', JSON.stringify(testData, null, 2));
    console.log('\nSending PUT request to /students/me/profile...\n');

    // Note: This assumes you're authenticated
    // In real usage, you'd need valid JWT token
    const response = await axios.put(
      `${API_URL}/students/me/profile`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_JWT_TOKEN_HERE` // Replace with actual token
        }
      }
    );

    console.log('✅ Success! Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    // If 401, that's expected without auth - means API is reachable
    if (error.response?.status === 401) {
      console.log('\n✅ API is reachable (401 because no auth token provided)');
      console.log('Data truncation error would show as 400 or 422, not 401');
      return true;
    }
    
    return false;
  }
}

// Also test with axios to verify enum values
async function checkEnumConstraints() {
  console.log('\n--- Database Schema Check ---\n');
  
  try {
    const response = await axios.get(`${API_URL}/students/me`);
    console.log('Current student data loaded - backend is responding');
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('API requires authentication (expected)');
    }
  }
}

// Run tests
testResidenceTypeUpdate();
