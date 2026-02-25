import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxLCJ0eXBlIjoiZGVwYXJ0bWVudC1hZG1pbiIsImZhY3VsdHlDb2RlIjoiQ1MxMiIsIm5hbWUiOiJEci5NQVRIQUxBSSBSQUouIEoiLCJlbWFpbCI6ImRybWF0aGFsYWkucmFqQG5zY2V0Lm9yZyIsInJvbGUiOiJkZXBhcnRtZW50LWFkbWluIiwiZGVwYXJ0bWVudCI6eyJpZCI6MSwiZnVsbF9uYW1lIjoiQi5FLiBDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJzaG9ydF9uYW1lIjoiQ1NFIn0sImlhdCI6MTc3MTk5Nzg5MywiZXhwIjoxNzcyMDAxNDkzfQ.V7qrlYwQRXQUpqWUfN8-UMqCd_pbpqn7uljfa6sp2rA';

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production');
  console.log('✅ Token verified successfully');
  console.log('Token payload:', JSON.stringify(decoded, null, 2));
  
  // Check what fields are in the token
  console.log('\n✅ Token has the following fields:');
  console.log('  - type:', decoded.type);
  console.log('  - id:', decoded.id);
  console.log('  - role:', decoded.role);
  console.log('  - email:', decoded.email);
  
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
}
