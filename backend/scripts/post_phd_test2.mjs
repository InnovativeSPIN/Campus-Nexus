import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const tokenFromMakeScript = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxLCJ0eXBlIjoiZmFjdWx0eSIsImlhdCI6MTc3MTkyMjA3NCwiZXhwIjoxNzcyNTI2ODc0fQ.AtecR3PauKTfwV9P-F74UCdz-ZbSJhLBoVs0ig4m02s';

(async () => {
  try {
    const res = await globalThis.fetch('http://localhost:3005/api/v1/faculty/phd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFromMakeScript}`
      },
      body: JSON.stringify({ status: 'Pursuing', orcid_id: '0000-0000-0000-0002', thesis_title: 'Node test thesis', register_no: 'NODE-002', guide_name: 'Dr. Node' })
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error(err);
  }
})();
