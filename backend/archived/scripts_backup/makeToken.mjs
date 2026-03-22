import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const payload = { id: 101, type: 'faculty' };
const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRE || '7d' });
console.log(token);
