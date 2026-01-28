/**
 * Creates test images for the converter tests
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';

// Create a 100x100 gradient (black to white, left to right)
const width = 100;
const height = 100;
const pixels = Buffer.alloc(width * height);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Gradient from left (black) to right (white)
    pixels[y * width + x] = width === 1 ? 0 : Math.round((x / (width - 1)) * 255);
  }
}

const gradient = await sharp(pixels, {
  raw: { width, height, channels: 1 }
})
  .png()
  .toBuffer();

writeFileSync('test/fixtures/gradient.png', gradient);
console.log('Created test/fixtures/gradient.png');

// Create a completely black image
const black = await sharp(Buffer.alloc(100 * 100, 0), {
  raw: { width: 100, height: 100, channels: 1 }
})
  .png()
  .toBuffer();

writeFileSync('test/fixtures/black.png', black);
console.log('Created test/fixtures/black.png');

// Create a completely white image
const white = await sharp(Buffer.alloc(100 * 100, 255), {
  raw: { width: 100, height: 100, channels: 1 }
})
  .png()
  .toBuffer();

writeFileSync('test/fixtures/white.png', white);
console.log('Created test/fixtures/white.png');

// Create a white circle on black background
const circleSize = 100;
const circlePixels = Buffer.alloc(circleSize * circleSize);
const centerX = circleSize / 2;
const centerY = circleSize / 2;
const radius = 40;

for (let y = 0; y < circleSize; y++) {
  for (let x = 0; x < circleSize; x++) {
    // Calculate distance from center
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // White (255) inside the circle, black (0) outside
    circlePixels[y * circleSize + x] = distance <= radius ? 255 : 0;
  }
}

const circle = await sharp(circlePixels, {
  raw: { width: circleSize, height: circleSize, channels: 1 }
})
  .png()
  .toBuffer();

writeFileSync('test/fixtures/circle.png', circle);
console.log('Created test/fixtures/circle.png');
