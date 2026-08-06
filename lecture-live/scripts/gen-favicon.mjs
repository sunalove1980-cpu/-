// favicon.svg를 여러 크기의 PNG로 변환한다.
// 사용법: npm i -D sharp && node scripts/gen-favicon.mjs && npm uninstall sharp
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../public/favicon.svg');
const outDir = path.join(__dirname, '../public');

const targets = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of targets) {
  await sharp(src, { density: 384 }).resize(size, size).png().toFile(path.join(outDir, name));
  console.log(`✓ ${name} (${size}x${size})`);
}
