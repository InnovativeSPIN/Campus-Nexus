import axios from 'axios';

const API_URL = 'http://localhost:3005/api/v1';

// Test data
const testEmail = 'vigneshls.faculty@nscet.org';
const testPassword = 'default_password'; // You may need to update this

async function testSubjectAPI() {
  try {
    console.log('🔐 Step 1: Login as department-admin (faculty)');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Logged in as:', user.Name, `(ID: ${user.id})`);
    console.log('Token:', token.substring(0, 20) + '...\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('📚 Step 2: Fetch department subjects');
    const subjectsResponse = await axios.get(`${API_URL}/department-admin/subjects`, { headers });
    console.log(`✅ Found ${subjectsResponse.data.count} subjects`);
    if (subjectsResponse.data.data.length > 0) {
      console.log('Sample subject:', JSON.stringify(subjectsResponse.data.data[0], null, 2));
    }
    console.log();

    console.log('👥 Step 3: Fetch available faculty for assignment');
    const facultyResponse = await axios.get(`${API_URL}/department-admin/subjects/available-faculty`, { headers });
    console.log(`✅ Found ${facultyResponse.data.count} available faculty`);
    if (facultyResponse.data.data.length > 0) {
      console.log('Sample faculty:', JSON.stringify(facultyResponse.data.data[0], null, 2));
    }
    console.log();

    if (subjectsResponse.data.data.length > 0 && facultyResponse.data.data.length > 0) {
      const subject = subjectsResponse.data.data[0];
      const faculty = facultyResponse.data.data[0];

      console.log('🔗 Step 4: Try to assign faculty to subject');
      console.log(`Assigning faculty ${faculty.Name} (ID: ${faculty.faculty_id}) to subject ${subject.subject_name} (ID: ${subject.id})`);

      try {
        const assignResponse = await axios.post(
          `${API_URL}/department-admin/subjects/${subject.id}/assign-faculty`,
          {
            faculty_id: faculty.faculty_id,
            academic_year: '2024-25',
            semester: subject.semester
          },
          { headers }
        );
        console.log('✅ Faculty assigned successfully!');
        console.log('Response:', JSON.stringify(assignResponse.data, null, 2));
      } catch (assignError) {
        console.log('❌ Assignment failed:');
        console.log('Status:', assignError.response?.status);
        console.log('Error:', assignError.response?.data || assignError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Full error:', error.response.data);
    }
  }
}

testSubjectAPI();
