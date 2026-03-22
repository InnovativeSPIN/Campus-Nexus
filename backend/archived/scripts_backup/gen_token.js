import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign({ id: 406, type: 'faculty' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
});

console.log(token);
