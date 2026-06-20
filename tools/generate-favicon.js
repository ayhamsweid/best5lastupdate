import fs from 'fs';
import pngToIco from 'png-to-ico';

const inputs = [
  'public/images/site-icon-32.png',
  'public/images/site-icon-16.png'
];

async function run() {
  try {
    const buf = await pngToIco(inputs);
    fs.writeFileSync('public/images/favicon.ico', buf);
    console.log('favicon.ico generated at public/images/favicon.ico');
  } catch (err) {
    console.error('Failed to generate favicon.ico:', err);
    process.exit(1);
  }
}

run();
const fs = require('fs');
const path = require('path');

const files = [
  path.resolve(__dirname, '../public/images/site-icon-32.png'),
  path.resolve(__dirname, '../public/images/site-icon-16.png')
].filter(f => fs.existsSync(f));

if (!files.length) {
  console.error('No PNG sources found at public/images/site-icon-32.png or site-icon-16.png');
  process.exit(2);
}

const images = files.map(f => ({ path: f, buf: fs.readFileSync(f) }));
const count = images.length;

// ICONDIR header (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type = 1 for icons
header.writeUInt16LE(count, 4);

const dirEntrySize = 16;
const dir = Buffer.alloc(dirEntrySize * count);
const imageDataBuffers = [];
let offset = 6 + dirEntrySize * count;

for (let i = 0; i < images.length; i++) {
  const img = images[i];
  const b = img.buf;
  const pngSize = b.length;
  // Width and height bytes: if 256 use 0, but we have 32 and 16
  const metadata = Buffer.alloc(dirEntrySize);
  const imgSize = require('fs').statSync(img.path).size;
  const fileName = path.basename(img.path);

  // Extract width/height from filename fallback
  let w = 0, h = 0;
  if (fileName.match(/-(\d+)\.png$/)) {
    w = parseInt(fileName.match(/-(\d+)\.png$/)[1], 10);
    h = w;
  } else {
    w = 32; h = 32;
  }

  metadata.writeUInt8(w === 256 ? 0 : w, 0); // width
  metadata.writeUInt8(h === 256 ? 0 : h, 1); // height
  metadata.writeUInt8(0, 2); // color palette
  metadata.writeUInt8(0, 3); // reserved
  metadata.writeUInt16LE(1, 4); // color planes
  metadata.writeUInt16LE(32, 6); // bits per pixel
  metadata.writeUInt32LE(pngSize, 8); // size of image data
  metadata.writeUInt32LE(offset, 12); // offset of image data

  images[i].dir = metadata;
  imageDataBuffers.push(b);
  offset += pngSize;
}

const out = Buffer.concat([header, ...images.map(im => im.dir), ...imageDataBuffers]);
const outPath = path.resolve(__dirname, '../public/images/favicon.ico');
fs.writeFileSync(outPath, out);
console.log('favicon.ico written to', outPath);
