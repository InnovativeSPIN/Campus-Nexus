import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxLCJ0eXBlIjoiZGVwYXJ0bWVudC1hZG1pbiIsImZhY3VsdHlDb2RlIjoiQ1MxMiIsIm5hbWUiOiJEci5NQVRIQUxBSSBSQUouIEoiLCJlbWFpbCI6ImRybWF0aGFsYWkucmFqQG5zY2V0Lm9yZyIsInJvbGUiOiJkZXBhcnRtZW50LWFkbWluIiwiZGVwYXJ0bWVudCI6eyJpZCI6MSwiZnVsbF9uYW1lIjoiQi5FLiBDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJzaG9ydF9uYW1lIjoiQ1NFIn0sImlhdCI6MTc3MTk5ODAzOSwiZXhwIjoxNzcyMDAxNjM5fQ.FiE9VRGnlTKhUjmV2PZtQriq1Tc5mDIAocMXxxENDNs';

const secrets = [
  'your_super_secret_jwt_key_here_change_in_production',
  'your_jwt_secret_key',
  'your_jwt_secret'
];

console.log('Testing token with different secrets...\n');

secrets.forEach((secret, idx) => {
  try {
    const decoded = jwt.verify(token, secret);
    console.log(`✅ Secret ${idx + 1} works: "${secret}"`);
  } catch (error) {
    console.log(`❌ Secret ${idx + 1} FAILED: "${secret}" - ${error.message}`);
  }
});
