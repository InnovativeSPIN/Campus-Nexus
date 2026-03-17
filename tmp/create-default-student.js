import fs from 'fs';
import path from 'path';

const out = path.resolve('frontend/public/uploads/default-student.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAQAAwABAgJ7RAkAAAAASUVORK5CYII=';
fs.writeFileSync(out, Buffer.from(base64, 'base64'));
console.log('wrote', out);
