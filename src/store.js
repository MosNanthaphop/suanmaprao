import { get, put } from '@vercel/blob';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(rootDir, 'data');
const dataFile = path.join(dataDir, 'garden.json');
const blobPath = 'suanmaprao/garden.json';
const initialState = {
  settings: {
    pricePerCoconut: 8,
    cycleDays: 45
  },
  harvests: []
};

let queue = Promise.resolve();

function useBlobStore() {
  return Boolean(process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN);
}

function assertBlobConfiguration() {
  const hasReadWriteToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasOidcCredentials = Boolean(process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID);
  if (hasReadWriteToken || hasOidcCredentials) return;

  const error = new Error('Vercel Blob ยังไม่ได้เชื่อมต่อกับโปรเจกต์ กรุณาสร้าง Blob store ในหน้า Storage ของ Vercel');
  error.status = 503;
  throw error;
}

async function readBlobState() {
  assertBlobConfiguration();
  const blob = await get(blobPath, { access: 'private' });
  if (!blob) return { state: structuredClone(initialState), etag: null };
  if (blob.statusCode !== 200 || !blob.stream) {
    throw new Error('อ่านข้อมูลสวนจาก Vercel Blob ไม่สำเร็จ');
  }

  const state = await new Response(blob.stream).json();
  return { state, etag: blob.blob.etag };
}

async function writeBlobState(state, etag) {
  await put(blobPath, JSON.stringify(state, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: Boolean(etag),
    ...(etag ? { ifMatch: etag } : {})
  });
}

async function ensureLocalStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(dataFile, JSON.stringify(initialState, null, 2), 'utf8');
  }
}

async function readLocalState() {
  await ensureLocalStore();
  return JSON.parse(await readFile(dataFile, 'utf8'));
}

function serialize(operation) {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
}

async function writeLocalState(state) {
  await ensureLocalStore();
  const tempFile = dataFile + '.tmp';
  await writeFile(tempFile, JSON.stringify(state, null, 2), 'utf8');
  await rename(tempFile, dataFile);
}

function isWriteConflict(error) {
  return error?.status === 409 || error?.status === 412 || error?.name === 'BlobPreconditionFailedError';
}

export function getState() {
  return serialize(async () => {
    if (!useBlobStore()) return readLocalState();
    return (await readBlobState()).state;
  });
}

export function updateState(update) {
  return serialize(async () => {
    if (!useBlobStore()) {
      const state = await readLocalState();
      const result = update(state);
      await writeLocalState(state);
      return result;
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { state, etag } = await readBlobState();
      const result = update(state);
      try {
        await writeBlobState(state, etag);
        return result;
      } catch (error) {
        if (!isWriteConflict(error) || attempt === 2) throw error;
      }
    }

    const error = new Error('ข้อมูลถูกแก้พร้อมกันหลายอุปกรณ์ กรุณาลองบันทึกอีกครั้ง');
    error.status = 409;
    throw error;
  });
}
