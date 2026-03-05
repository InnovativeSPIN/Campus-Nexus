import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

(async () => {
  const form = new FormData();
  const data = `facultyId,facultyName,department,year,day,hour,subject,academicYear
CS12,Dr.MATHALAI RAJ. J,CSE,3,Monday,1,Data Structures,2026-2027`;
  fs.writeFileSync('tmp.csv', data);
  form.append('file', fs.createReadStream('tmp.csv'));
  form.append('academicYear', '2026-2027');
  form.append('semester', 'odd');
  try {
    const res = await fetch('http://localhost:3005/api/v1/timetable/bulk-upload', {
      method: 'POST',
      body: form,
      headers: {
        Authorization: 'Bearer ' + (process.env.TEST_TOKEN || '')
      }
    });
    const text = await res.text();
    console.log('status', res.status, text);
  } catch (err) {
    console.error(err);
  }
})();