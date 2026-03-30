import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const token = jwt.sign({ id: 101, type: 'faculty' }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production', { expiresIn: process.env.JWT_EXPIRE || '7d' });
(async ()=>{
  const res = await globalThis.fetch('http://localhost:3005/api/v1/faculty/experience/industry', { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.text();
  console.log('status', res.status);
  console.log(body);
})();
