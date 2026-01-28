/**
 * Skapar testbilder för converter-testerna
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';

// Skapa en 100x100 gradient (svart till vit, vänster till höger)
const width = 100;
const height = 100;
const pixels = Buffer.alloc(width * height);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Gradient från vänster (svart) till höger (vit)
    pixels[y * width + x] = Math.round((x / width) * 255);
  }
}

const gradient = await sharp(pixels, {
  raw: { width, height, channels: 1 }
}).png().toBuffer();

writeFileSync('test/fixtures/gradient.png', gradient);
console.log('Created test/fixtures/gradient.png');

// Skapa en helt svart bild
const black = await sharp(Buffer.alloc(100 * 100, 0), {
  raw: { width: 100, height: 100, channels: 1 }
}).png().toBuffer();

writeFileSync('test/fixtures/black.png', black);
console.log('Created test/fixtures/black.png');

// Skapa en helt vit bild
const white = await sharp(Buffer.alloc(100 * 100, 255), {
  raw: { width: 100, height: 100, channels: 1 }
}).png().toBuffer();

writeFileSync('test/fixtures/white.png', white);
console.log('Created test/fixtures/white.png');

// Skapa en vit cirkel på svart bakgrund
const circleSize = 100;
const circlePixels = Buffer.alloc(circleSize * circleSize);
const centerX = circleSize / 2;
const centerY = circleSize / 2;
const radius = 40;

for (let y = 0; y < circleSize; y++) {
  for (let x = 0; x < circleSize; x++) {
    // Beräkna avstånd från centrum
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Vit (255) inuti cirkeln, svart (0) utanför
    circlePixels[y * circleSize + x] = distance <= radius ? 255 : 0;
  }
}

const circle = await sharp(circlePixels, {
  raw: { width: circleSize, height: circleSize, channels: 1 }
}).png().toBuffer();

writeFileSync('test/fixtures/circle.png', circle);
console.log('Created test/fixtures/circle.png');
