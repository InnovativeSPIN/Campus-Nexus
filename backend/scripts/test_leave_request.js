import http from 'http';

const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/v1/student-leaves/class-incharge',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDA2LCJ0eXBlIjoiZmFjdWx0eSIsImlhdCI6MTc3Mjc1NjQyMywiZXhwIjoxNzczMzYxMjIzfQ.HAjybwGQHjEMpH9MSHb-75VanjpVIOwYyHEQZPqenUw'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
