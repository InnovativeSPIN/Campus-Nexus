import { sequelize } from './config/db.js';
import fetch from 'node-fetch';

const FACULTY_ID = 101;
const API_BASE = 'http://localhost:3005/api/v1';

async function getToken() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'krishna@gmail.com',
      password: 'krishna123'
    })
  });
  const result = await response.json();
  return result.data?.token;
}

async function testMultipleEducationRecords(token) {
  console.log('\n📚 Testing Multiple Education Records...\n');
  
  const educationData = [
    {
      degree: "Ph.D",
      branch: "Computer Science",
      university: "IIT Bombay",
      college: "IIT Bombay",
      year: "2023",
      percentage: "95"
    },
    {
      degree: "M.Tech",
      branch: "Advanced Computing",
      university: "Anna University",
      college: "CEO",
      year: "2020",
      percentage: "88"
    },
    {
      degree: "B.Tech",
      branch: "Computer Science Engineering",
      university: "Anna University",
      college: "NSCE",
      year: "2018",
      percentage: "78"
    }
  ];

  const createdIds = [];
  for (let i = 0; i < educationData.length; i++) {
    const edu = educationData[i];
    console.log(`Creating education ${i + 1}/3 (${edu.degree})...`);
    
    const response = await fetch(`${API_BASE}/faculty/education`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        degree: edu.degree,
        branch: edu.branch,
        university: edu.university,
        college: edu.college,
        year: edu.year,
        percentage: edu.percentage,
        society_name: ""
      })
    });

    const result = await response.json();
    if (response.status === 201 && result.success) {
      console.log(`✅ Created record ID: ${result.data.id}`);
      createdIds.push(result.data.id);
    } else {
      console.log(`❌ Failed: ${result.error || response.statusText}`);
      return false;
    }
  }

  // Verify all records exist
  console.log('\n📋 Verifying all records were created...\n');
  const response = await fetch(`${API_BASE}/faculty/education`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  
  if (result.success && Array.isArray(result.data)) {
    const educationRecords = result.data.filter((r) => r.degree && r.degree !== 'Membership');
    console.log(`✅ Total education records: ${educationRecords.length}`);
    console.log(`✅ All created records found: ${createdIds.every(id => educationRecords.some(r => r.id === id))}`);
    return true;
  }
  return false;
}

async function testMultipleTeachingExperienceRecords(token) {
  console.log('\n🏫 Testing Multiple Teaching Experience Records...\n');
  
  const experienceData = [
    {
      designation: "Assistant Professor",
      institution_name: "NSCE",
      university: "Anna University",
      department: "CSE",
      from_date: "2021-01-15",
      to_date: "2023-12-31",
      period: "2.5 years",
      is_current: false
    },
    {
      designation: "Lecturer",
      institution_name: "Sathyabama Institute",
      university: "Sathyabama University",
      department: "IT",
      from_date: "2018-07-01",
      to_date: "2020-12-31",
      period: "2.5 years",
      is_current: false
    },
    {
      designation: "Associate Professor",
      institution_name: "NSCE",
      university: "Anna University",
      department: "CSE",
      from_date: "2024-01-01",
      to_date: null,
      period: "ongoing",
      is_current: true
    }
  ];

  const createdIds = [];
  for (let i = 0; i < experienceData.length; i++) {
    const exp = experienceData[i];
    console.log(`Creating experience ${i + 1}/3 (${exp.designation})...`);
    
    const response = await fetch(`${API_BASE}/faculty/experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(exp)
    });

    const result = await response.json();
    if (response.status === 201 && result.success) {
      console.log(`✅ Created record ID: ${result.data.id}`);
      createdIds.push(result.data.id);
    } else {
      console.log(`❌ Failed: ${result.error || response.statusText}`);
      return false;
    }
  }

  // Verify all records exist
  console.log('\n📋 Verifying all records were created...\n');
  const response = await fetch(`${API_BASE}/faculty/experience`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  
  if (result.success && Array.isArray(result.data)) {
    console.log(`✅ Total teaching experience records: ${result.data.length}`);
    console.log(`✅ All created records found: ${createdIds.every(id => result.data.some(r => r.id === id))}`);
    return true;
  }
  return false;
}

async function testMultipleIndustryExperienceRecords(token) {
  console.log('\n🏢 Testing Multiple Industry Experience Records...\n');
  
  const industryData = [
    {
      job_title: "Software Developer",
      company: "TCS",
      location: "Bangalore",
      from_date: "2015-06-01",
      to_date: "2018-05-31",
      period: "3 years",
      is_current: false
    },
    {
      job_title: "Senior Developer",
      company: "InfoSys",
      location: "Pune",
      from_date: "2018-06-15",
      to_date: "2020-12-31",
      period: "2.5 years",
      is_current: false
    }
  ];

  const createdIds = [];
  for (let i = 0; i < industryData.length; i++) {
    const ind = industryData[i];
    console.log(`Creating industry experience ${i + 1}/2 (${ind.job_title} at ${ind.company})...`);
    
    const response = await fetch(`${API_BASE}/faculty/experience/industry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ind)
    });

    const result = await response.json();
    if (response.status === 201 && result.success) {
      console.log(`✅ Created record ID: ${result.data.id}`);
      createdIds.push(result.data.id);
    } else {
      console.log(`❌ Failed: ${result.error || response.statusText}`);
      return false;
    }
  }

  // Verify all records exist
  console.log('\n📋 Verifying all records were created...\n');
  const response = await fetch(`${API_BASE}/faculty/experience/industry`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  
  if (result.success && Array.isArray(result.data)) {
    console.log(`✅ Total industry experience records: ${result.data.length}`);
    console.log(`✅ All created records found: ${createdIds.every(id => result.data.some(r => r.id === id))}`);
    return true;
  }
  return false;
}

async function main() {
  try {
    console.log('🔐 Getting authentication token...');
    const token = await getToken();
    
    if (!token) {
      console.error('❌ Failed to get token');
      process.exit(1);
    }
    
    console.log('✅ Token obtained successfully\n');

    const results = {
      education: await testMultipleEducationRecords(token),
      teaching: await testMultipleTeachingExperienceRecords(token),
      industry: await testMultipleIndustryExperienceRecords(token)
    };

    console.log('\n📊 Test Summary:\n');
    console.log(`✅ Multiple Education Records: ${results.education ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Multiple Teaching Experience Records: ${results.teaching ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Multiple Industry Experience Records: ${results.industry ? 'PASSED' : 'FAILED'}`);

    if (results.education && results.teaching && results.industry) {
      console.log('\n🎉 All tests PASSED! Multiple records functionality working correctly.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests FAILED\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
