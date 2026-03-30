import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign({ id: 101, type: 'faculty' }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production', { expiresIn: '7d' });

(async ()=>{
  try {
    const res = await fetch('http://localhost:3005/api/v1/faculty/experience/industry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ job_title: 'Senior Engineer', company: 'Acme Corp', location: 'Bangalore', from_date: '2018-01-01', to_date: '2020-12-31', period: '3 years', is_current: false })
    });

    const text = await res.text();
    console.log('status', res.status);
    console.log('body', text);
  } catch (err) {
    console.error('ERR', err);
  }
})();
