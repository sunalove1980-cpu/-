// 아이콘 소스 SVG를 필요한 크기의 PNG/파비콘으로 일괄 변환하는 1회성 빌드 스크립트
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('../public/icons/', import.meta.url));
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const jobs = [
  { src: 'icon-source.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon-source.svg', out: 'icon-512.png', size: 512 },
  { src: 'icon-source.svg', out: 'apple-touch-icon.png', size: 180 },
  { src: 'icon-source.svg', out: 'favicon-32.png', size: 32 },
  { src: 'icon-source.svg', out: 'favicon-16.png', size: 16 },
  { src: 'icon-maskable-source.svg', out: 'maskable-192.png', size: 192 },
  { src: 'icon-maskable-source.svg', out: 'maskable-512.png', size: 512 },
];

for (const job of jobs) {
  const srcPath = fileURLToPath(new URL(job.src, import.meta.url));
  const outPath = outDir + job.out;
  await sharp(srcPath, { density: 384 })
    .resize(job.size, job.size)
    .png()
    .toFile(outPath);
  console.log('generated', job.out);
}

// favicon.ico는 16px/32px PNG를 함께 담아 브라우저 탭에서 선명하게 보이도록 한다.
const icoBuffer = await pngToIco([outDir + 'favicon-16.png', outDir + 'favicon-32.png']);
writeFileSync(publicDir + 'favicon.ico', icoBuffer);
console.log('generated favicon.ico');
