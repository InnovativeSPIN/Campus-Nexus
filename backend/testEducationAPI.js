const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxLCJ0eXBlIjoiZGVwYXJ0bWVudC1hZG1pbiIsImZhY3VsdHlDb2RlIjoiQ1MxMiIsIm5hbWUiOiJEci5NQVRIQUxBSSBSQUouIEoiLCJlbWFpbCI6ImRybWF0aGFsYWkucmFqQG5zY2V0Lm9yZyIsInJvbGUiOiJkZXBhcnRtZW50LWFkbWluIiwiZGVwYXJ0bWVudCI6eyJpZCI6MSwiZnVsbF9uYW1lIjoiQi5FLiBDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJzaG9ydF9uYW1lIjoiQ1NFIn0sImlhdCI6MTc3MTk5ODQ4MiwiZXhwIjoxNzcyMDAyMDgyfQ.myMY2SbaXvakIZUGjj5ZcCkj8ClOhH4J82dP3qZ0Xh0';

(async () => {
  try {
    console.log('Testing education POST endpoint...\n');
    
    const testData = {
      degree: 'M.Tech',
      branch: 'Data Science',
      college: 'Test College',
      university: 'Test University',
      year: '2025',
      percentage: '90',
      society_name: ''
    };
    
    console.log('Request Data:', JSON.stringify(testData, null, 2));
    
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
      console.log('\n✅ SUCCESS! Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('\n❌ ERROR:', response.status);
      console.error('Message:', data?.error || data?.message);
      console.error('\nFull Response:');
      console.error(JSON.stringify(data, null, 2));
    }
    
    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Connection Error:');
    console.error(error.message);
    process.exit(1);
  }
})();
