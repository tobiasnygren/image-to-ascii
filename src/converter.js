/**
 * Converts images to ASCII art
 */
import sharp from 'sharp';
import { standard as defaultCharset } from './charsets.js';

/**
 * Converts an image buffer to ASCII text
 *
 * @param {Buffer} imageBuffer - Image data as Buffer
 * @param {Object} options - Settings
 * @param {number} options.width - Desired width in characters (default: 80)
 * @param {string} options.charset - Character set to use
 * @returns {Promise<string>} ASCII representation of the image
 */
export async function convertToAscii(imageBuffer, options = {}) {
  const { width = 80, charset = defaultCharset } = options;

  // Step 1: Load the image and get metadata
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  // Validate that the image has valid dimensions
  const imgWidth = metadata.width;
  const imgHeight = metadata.height;

  if (
    !Number.isFinite(imgWidth) ||
    !Number.isFinite(imgHeight) ||
    imgWidth <= 0 ||
    imgHeight <= 0
  ) {
    throw new Error('Invalid image dimensions');
  }

  // Step 2: Calculate height with adjustment for character proportions
  // Characters are roughly twice as tall as they are wide, so we halve the height
  const aspectRatio = imgHeight / imgWidth;
  const height = Math.max(1, Math.round(width * aspectRatio * 0.5));

  // Step 3: Convert to grayscale and scale down
  const { data, info } = await image
    .greyscale() // Convert to grayscale
    .resize(width, height, {
      // Scale to desired size
      fit: 'fill'
    })
    .raw() // Get raw pixel data (not PNG/JPG)
    .toBuffer({ resolveWithObject: true });

  // Step 4: Build ASCII string
  // 'data' is a Buffer where each byte is the brightness (0-255) for a pixel
  const asciiChars = [];

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const pixelIndex = y * info.width + x;
      const brightness = data[pixelIndex];
      asciiChars.push(brightnessToChar(brightness, charset));
    }
    asciiChars.push('\n');
  }

  return asciiChars.join('');
}

/**
 * Maps a brightness value (0-255) to an ASCII character
 *
 * @param {number} brightness - Brightness 0-255 (0 = black, 255 = white)
 * @param {string} charset - Character set (dark to light)
 * @returns {string} An ASCII character
 */
export function brightnessToChar(brightness, charset = defaultCharset) {
  // Normalize to index in charset
  const index = Math.floor((brightness / 255) * (charset.length - 1));
  return charset[index];
}
