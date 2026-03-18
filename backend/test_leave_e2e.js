/**
 * Full end-to-end test: login as student → submit leave with attachment
 * Uses only built-in Node.js modules
 */
import fs from 'fs';
import http from 'http';

const HOST = '127.0.0.1';
const PORT = 3005;

function httpPostJson(urlPath, body, headers = {}) {
    const bodyStr = JSON.stringify(body);
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: HOST, port: PORT, path: urlPath, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...headers }
        };
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

function httpPostMultipart(urlPath, fields, fileField, fileContent, fileName, mimeType, headers = {}) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Date.now().toString(16);
        let bodyParts = [];
        // Text fields
        for (const [name, value] of Object.entries(fields)) {
            bodyParts.push(
                Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`)
            );
        }
        // File field
        bodyParts.push(
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`)
        );
        bodyParts.push(fileContent);
        bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
        
        const body = Buffer.concat(bodyParts);
        
        const opts = {
            hostname: HOST, port: PORT, path: urlPath, method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
                ...headers
            }
        };
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// Step 1: Login as student
console.log('=== STEP 1: Login ===');
const { headers: { 'content-type': ct } = {}, status: s, body: loginBody } = 
    await httpPostJson('/api/v1/auth/login', {
        email: '921024243001@nscet.org',
        password: '921024243001'
    });

console.log('Login status:', s);
const loginData = JSON.parse(loginBody);

if (!loginData.success) {
    console.log('Login failed, trying student-login route...');
    const { status: s2, body: lb2 } = await httpPostJson('/api/v1/auth/student-login', {
        studentId: '921024243001@nscet.org',
        password: '921024243001'
    });
    console.log('student-login status:', s2, JSON.parse(lb2));
    process.exit(0);
}

const token = loginData.token;
const studentId = loginData.data?.id;
console.log('✅ Logged in! Student ID:', studentId, 'Token:', token?.substring(0,30));

// Step 2: Submit leave WITHOUT file (quick test first)
console.log('\n=== STEP 2a: Submit leave WITHOUT file ===');
const noFileRes = await httpPostJson('/api/v1/student-leaves', {
    leaveType: 'Medical',
    leaveSubType: 'Sick',
    startDate: '2026-03-25',
    endDate: '2026-03-26',
    totalDays: '2',
    reason: 'JSON test - no file',
    recipient: 'Class Incharge'
}, { 'Authorization': `Bearer ${token}` });

console.log('No-file status:', noFileRes.status);
const noFileData = JSON.parse(noFileRes.body);
console.log('No-file response:', JSON.stringify(noFileData, null, 2));

// Step 3: Submit leave WITH file (multipart)
console.log('\n=== STEP 2b: Submit leave WITH file (multipart) ===');
const fakeFile = Buffer.from('%PDF-1.4 1 0 obj<</Type /Catalog>> endobj');
const withFileRes = await httpPostMultipart(
    '/api/v1/student-leaves',
    {
        leaveType: 'Medical',
        leaveSubType: 'Sick',
        startDate: '2026-03-27',
        endDate: '2026-03-28',
        totalDays: '2',
        reason: 'Multipart test with file attachment',
        recipient: 'Class Incharge'
    },
    'attachment', fakeFile, 'medical_cert.pdf', 'application/pdf',
    { 'Authorization': `Bearer ${token}` }
);

console.log('With-file status:', withFileRes.status);
const withFileData = JSON.parse(withFileRes.body);
console.log('With-file response:', JSON.stringify(withFileData, null, 2));

if (withFileData.data) {
    console.log('\n✅ SUCCESS! Leave created:');
    console.log('  ID:', withFileData.data.id);
    console.log('  Attachment stored:', withFileData.data.attachment);
    console.log('  submitted_to:', withFileData.data.submitted_to);
}

process.exit(0);
