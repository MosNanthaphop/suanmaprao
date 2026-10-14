import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { getState, updateState } from './store.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'frontend', 'dist');
const port = Number(process.env.PORT) || 3000;
const maxBodySize = 1024 * 64;
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > maxBodySize) throw new HttpError(413, 'ข้อมูลมีขนาดใหญ่เกินไป');
  }
  try {
    return JSON.parse(body || '{}');
  } catch {
    throw new HttpError(400, 'รูปแบบข้อมูลไม่ถูกต้อง');
  }
}

function validateHarvest(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'ข้อมูลรอบตัดไม่ถูกต้อง');
  }
  if (typeof payload.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    throw new HttpError(400, 'กรุณาระบุวันที่ตัด');
  }
  const [year, month, day] = payload.date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new HttpError(400, 'วันที่ไม่ถูกต้อง');
  }
  const quantity = Number(payload.quantity);
  const pricePerCoconut = Number(payload.pricePerCoconut);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000000) {
    throw new HttpError(400, 'จำนวนมะพร้าวต้องเป็นจำนวนเต็มที่มากกว่า 0');
  }
  if (!Number.isFinite(pricePerCoconut) || pricePerCoconut < 0 || pricePerCoconut > 1000000) {
    throw new HttpError(400, 'ราคาต่อลูกต้องเป็นตัวเลขตั้งแต่ 0 บาทขึ้นไป');
  }
  if (payload.note != null && (typeof payload.note !== 'string' || payload.note.length > 240)) {
    throw new HttpError(400, 'หมายเหตุยาวได้ไม่เกิน 240 ตัวอักษร');
  }
  return {
    date: payload.date,
    quantity,
    pricePerCoconut: Math.round(pricePerCoconut * 100) / 100,
    note: (payload.note || '').trim()
  };
}

function validateSettings(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'ข้อมูลการตั้งค่าไม่ถูกต้อง');
  }
  const pricePerCoconut = Number(payload.pricePerCoconut);
  const cycleDays = Number(payload.cycleDays);
  if (!Number.isFinite(pricePerCoconut) || pricePerCoconut < 0 || pricePerCoconut > 1000000) {
    throw new HttpError(400, 'ราคาต่อลูกต้องเป็นตัวเลขตั้งแต่ 0 บาทขึ้นไป');
  }
  if (!Number.isInteger(cycleDays) || cycleDays < 1 || cycleDays > 365) {
    throw new HttpError(400, 'รอบการตัดต้องอยู่ระหว่าง 1 ถึง 365 วัน');
  }
  return { pricePerCoconut: Math.round(pricePerCoconut * 100) / 100, cycleDays };
}

async function serveStatic(pathname, response, isHead = false) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    throw new HttpError(400, 'ที่อยู่หน้าเว็บไม่ถูกต้อง');
  }
  const requested = decodedPath === '/' ? '/index.html' : decodedPath;
  const filePath = path.resolve(publicDir, '.' + requested);
  if (!filePath.startsWith(publicDir + path.sep)) throw new HttpError(403, 'ไม่มีสิทธิ์เข้าถึงไฟล์นี้');
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new HttpError(404, 'ไม่พบหน้าเว็บนี้');
    const content = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': content.length,
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(isHead ? undefined : content);
  } catch (error) {
    if (error.code === 'ENOENT') throw new HttpError(404, 'ไม่พบหน้าเว็บนี้');
    throw error;
  }
}

async function handleRequest(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    if (request.method === 'GET' && pathname === '/api/state') {
      return sendJson(response, 200, await getState());
    }

    if (request.method === 'PUT' && pathname === '/api/settings') {
      const settings = validateSettings(await readJson(request));
      const state = await updateState((current) => {
        current.settings = settings;
        return current;
      });
      return sendJson(response, 200, state);
    }

    if (pathname === '/api/harvests' && request.method === 'POST') {
      const values = validateHarvest(await readJson(request));
      const state = await updateState((current) => {
        current.harvests.push({ id: randomUUID(), ...values, createdAt: new Date().toISOString() });
        return current;
      });
      return sendJson(response, 201, state);
    }

    const harvestMatch = pathname.match(/^\/api\/harvests\/([0-9a-f-]+)$/i);
    if (harvestMatch && request.method === 'PUT') {
      const values = validateHarvest(await readJson(request));
      const state = await updateState((current) => {
        const harvest = current.harvests.find((item) => item.id === harvestMatch[1]);
        if (!harvest) throw new HttpError(404, 'ไม่พบรอบตัดที่ต้องการแก้ไข');
        Object.assign(harvest, values);
        return current;
      });
      return sendJson(response, 200, state);
    }

    if (harvestMatch && request.method === 'DELETE') {
      const state = await updateState((current) => {
        const index = current.harvests.findIndex((item) => item.id === harvestMatch[1]);
        if (index === -1) throw new HttpError(404, 'ไม่พบรอบตัดที่ต้องการลบ');
        current.harvests.splice(index, 1);
        return current;
      });
      return sendJson(response, 200, state);
    }

    return sendJson(response, 404, { error: 'ไม่พบ API นี้' });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    throw new HttpError(405, 'ไม่รองรับคำขอนี้');
  }
  return serveStatic(pathname, response, request.method === 'HEAD');
}

const server = createServer(async (request, response) => {
  try {
    await handleRequest(request, response);
  } catch (error) {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error(error);
    sendJson(response, status, { error: status === 500 ? 'เกิดข้อผิดพลาดในระบบ' : error.message });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log('API พร้อมที่ http://localhost:' + port);
  console.log('หน้า production ใช้พอร์ตนี้หลังจากรัน npm run build');
});
