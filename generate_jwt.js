const jwt = require('jsonwebtoken');

const secret = 'smpp-subscription-management-secret-key-for-development-only';

const payload = {
  sub: '1',
  username: 'admin',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  active: true,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

const token = jwt.sign(payload, secret);

console.log('Generated JWT Token:');
console.log(token);

console.log('\nToken parts:');
const parts = token.split('.');
console.log('Header:', Buffer.from(parts[0], 'base64').toString());
console.log('Payload:', Buffer.from(parts[1], 'base64').toString());