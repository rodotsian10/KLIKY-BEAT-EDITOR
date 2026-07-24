const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../dist/CanonDreamy.wav');
const distDir = path.join(__dirname, '../public/audio');
const destPath = path.join(distDir, 'canon_harp.dat');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('Reading source WAV file:', srcPath);
const fileBuffer = fs.readFileSync(srcPath);

// Secret Masking Key for XOR encryption
const SECRET_KEY = Buffer.from('KLIKY_BEAT_NEKO_LEGENDS_CANON_HARP_2026');

console.log(`Original file size: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB`);

// Apply XOR encryption over binary buffer
const encryptedBuffer = Buffer.alloc(fileBuffer.length);
for (let i = 0; i < fileBuffer.length; i++) {
  encryptedBuffer[i] = fileBuffer[i] ^ SECRET_KEY[i % SECRET_KEY.length];
}

fs.writeFileSync(destPath, encryptedBuffer);
console.log(`Encrypted dat file saved to: ${destPath} (${(encryptedBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
