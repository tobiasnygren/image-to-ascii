/**
 * Converts images to ASCII art
 */
import { processImage } from './imageProcessors/sharp.js';
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

  // Step 1: Decode image, convert to grayscale and scale down
  const { data, width: w, height: h } = await processImage(imageBuffer, width);

  // Step 2: Build ASCII string
  // 'data' is a flat Uint8Array where each byte is the brightness (0-255) for a pixel
  const asciiChars = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const brightness = data[y * w + x];
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
