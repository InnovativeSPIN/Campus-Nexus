import { sequelize } from './config/db.js';
import jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxLCJ0eXBlIjoiZGVwYXJ0bWVudC1hZG1pbiIsImZhY3VsdHlDb2RlIjoiQ1MxMiIsIm5hbWUiOiJEci5NQVRIQUxBSSBSQUouIEoiLCJlbWFpbCI6ImRybWF0aGFsYWkucmFqQG5zY2V0Lm9yZyIsInJvbGUiOiJkZXBhcnRtZW50LWFkbWluIiwiZGVwYXJ0bWVudCI6eyJpZCI6MSwiZnVsbF9uYW1lIjoiQi5FLiBDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJzaG9ydF9uYW1lIjoiQ1NFIn0sImlhdCI6MTc3MTk5ODQ4MiwiZXhwIjoxNzcyMDAyMDgyfQ.myMY2SbaXvakIZUGjj5ZcCkj8ClOhH4J82dP3qZ0Xh0';

(async () => {
  try {
    console.log('Testing multiple education records creation...\n');
    
    const records = [
      {
        degree: 'B.E.',
        branch: 'Computer Science',
        college: 'Anna University',
        university: 'Anna University',
        year: '2015',
        percentage: '87',
        society_name: ''
      },
      {
        degree: 'M.Tech',
        branch: 'Data Science',
        college: 'IIT Madras',
        university: 'Anna University',
        year: '2018',
        percentage: '92',
        society_name: ''
      },
      {
        degree: 'Ph.D.',
        branch: 'Machine Learning',
        college: 'IIT Madras',
        university: 'Anna University',
        year: '2022',
        percentage: '95',
        society_name: ''
      }
    ];
    
    console.log('📝 Creating', records.length, 'education records...\n');
    
    for (let i = 0; i < records.length; i++) {
      const testData = records[i];
      
      const response = await fetch('http://localhost:3005/api/v1/faculty/education', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Record ${i + 1} created:`, {
          membership_id: data.data.membership_id,
          degree: data.data.degree,
          branch: data.data.branch
        });
      } else {
        console.error(`❌ Record ${i + 1} failed:`, data.error);
      }
    }
    
    console.log('\n📊 Fetching all education records...');
    
    const getResponse = await fetch('http://localhost:3005/api/v1/faculty/education', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const allRecords = await getResponse.json();
    
    if (getResponse.ok) {
      console.log(`✅ Total records: ${allRecords.data.length}`);
      allRecords.data.forEach((record, idx) => {
        console.log(`  ${idx + 1}. ${record.degree} in ${record.branch} (ID: ${record.membership_id})`);
      });
    } else {
      console.error('❌ Failed to fetch records:', allRecords.error);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.message);
    process.exit(1);
  }
})();
