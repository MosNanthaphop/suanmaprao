import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(rootDir, 'data');
const dataFile = path.join(dataDir, 'garden.json');
const initialState = {
  settings: {
    pricePerCoconut: 8,
    cycleDays: 45
  },
  harvests: []
};

let queue = Promise.resolve();

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(dataFile, JSON.stringify(initialState, null, 2), 'utf8');
  }
}

async function readState() {
  await ensureStore();
  return JSON.parse(await readFile(dataFile, 'utf8'));
}

function serialize(operation) {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
}

async function writeState(state) {
  await ensureStore();
  const tempFile = dataFile + '.tmp';
  await writeFile(tempFile, JSON.stringify(state, null, 2), 'utf8');
  await rename(tempFile, dataFile);
}

export function getState() {
  return serialize(readState);
}

export function updateState(update) {
  return serialize(async () => {
    const state = await readState();
    const result = update(state);
    await writeState(state);
    return result;
  });
}
