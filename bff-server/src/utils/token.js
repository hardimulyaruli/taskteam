const crypto = require('crypto');

const TOKEN_SECRET = process.env.AUTH_SECRET || 'taskteam-dev-secret';
const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 24);

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(`${base64}${padding}`, 'base64').toString('utf8');
}

function sign(input) {
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(input)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createToken(user) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    }),
  );

  const signature = sign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Token tidak valid.');
  }

  const [header, payload, signature] = parts;
  const expectedSignature = sign(`${header}.${payload}`);

  if (signature !== expectedSignature) {
    throw new Error('Signature token tidak valid.');
  }

  const parsedPayload = JSON.parse(base64UrlDecode(payload));
  const now = Math.floor(Date.now() / 1000);
  if (parsedPayload.exp <= now) {
    throw new Error('Token sudah kedaluwarsa.');
  }

  return {
    id: parsedPayload.sub,
    username: parsedPayload.username,
    role: parsedPayload.role,
    name: parsedPayload.name,
  };
}

module.exports = {
  createToken,
  verifyToken,
};
