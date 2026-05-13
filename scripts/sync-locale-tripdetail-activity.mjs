/**
 * Fills missing keys under tripDetail and activityModal from en.json into all other locale files.
 * Run from repo root: node scripts/sync-locale-tripdetail-activity.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/lib/locales');

function deepMergeMissing(target, source) {
  if (source == null || typeof source !== 'object' || Array.isArray(source)) {
    return;
  }
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== 'object' || Array.isArray(target[k])) {
        target[k] = {};
      }
      deepMergeMissing(target[k], v);
    } else if (target[k] === undefined) {
      target[k] = v;
    }
  }
}

const enPath = path.join(LOCALES_DIR, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const branches = ['tripDetail', 'activityModal'];

for (const file of fs.readdirSync(LOCALES_DIR)) {
  if (!file.endsWith('.json') || file === 'en.json') continue;
  const filePath = path.join(LOCALES_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const b of branches) {
    if (en[b] && typeof en[b] === 'object') {
      if (!data[b] || typeof data[b] !== 'object') data[b] = {};
      deepMergeMissing(data[b], en[b]);
    }
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

console.log('Synced tripDetail + activityModal missing keys from en.json into all locale files.');
