import { timingSafeEqual } from 'node:crypto';
import { handleRequestSafely } from '../src/server.js';

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers
  });
  response.end(JSON.stringify(value));
}

function passwordMatches(candidate, expected) {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes);
}

export default async function handleApiRequest(request, response) {
  const expectedPassword = process.env.APP_PASSWORD;
  if (!expectedPassword) {
    return sendJson(response, 503, {
      error: 'ตั้งค่า APP_PASSWORD ใน Environment Variables ของ Vercel ก่อนใช้งาน API'
    });
  }

  const authorization = request.headers.authorization || '';
  const candidate = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!candidate || !passwordMatches(candidate, expectedPassword)) {
    return sendJson(response, 401, { error: 'กรุณาใส่รหัสผ่านแอปให้ถูกต้อง' }, {
      'WWW-Authenticate': 'Bearer'
    });
  }

  return handleRequestSafely(request, response);
}
