import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET not set in env');
  process.exit(1);
}

const payload = {
  id: 3686,
  type: 'student'
};

const token = jwt.sign(payload, secret, { expiresIn: '7d' });
console.log('JWT:', token);
