import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const inputs = [
  path.resolve(rootDir, 'public/images/site-icon-32.png'),
  path.resolve(rootDir, 'public/images/site-icon-16.png')
].filter((file) => fs.existsSync(file));

if (!inputs.length) {
  console.error('No PNG sources found at public/images/site-icon-32.png or site-icon-16.png');
  process.exit(2);
}

const pngs = inputs.map((file) => ({
  file,
  data: fs.readFileSync(file),
  size: Number(path.basename(file).match(/-(\d+)\.png$/)?.[1] || 32)
}));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);

let offset = 6 + pngs.length * 16;
const entries = pngs.map(({ data, size }) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += data.length;
  return entry;
});

const ico = Buffer.concat([header, ...entries, ...pngs.map((png) => png.data)]);
const outputs = [
  path.resolve(rootDir, 'public/favicon.ico'),
  path.resolve(rootDir, 'public/images/favicon.ico')
];

for (const output of outputs) {
  fs.writeFileSync(output, ico);
  console.log('favicon.ico written to', output);
}
