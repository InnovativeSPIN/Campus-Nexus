import { exec } from 'child_process';
import util from 'util';
const execp = util.promisify(exec);

try {
  const { stdout } = await execp('node backend/scripts/makeToken.mjs');
  const token = stdout.trim();
  const url = 'http://localhost:3005/api/v1/faculty/experience';
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  console.log('STATUS:', res.status, res.statusText);
  console.log('HEADERS:', Object.fromEntries(res.headers.entries()));
  console.log('BODY:', text);
} catch (err) {
  console.error('ERROR:', err);
}
