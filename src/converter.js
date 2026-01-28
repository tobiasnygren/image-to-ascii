/**
 * Konverterar bilder till ASCII-konst
 */
import sharp from 'sharp';
import { standard as defaultCharset } from './charsets.js';

/**
 * Konverterar en bild-buffer till ASCII-text
 *
 * @param {Buffer} imageBuffer - Bilddata som Buffer
 * @param {Object} options - Inställningar
 * @param {number} options.width - Önskad bredd i tecken (default: 80)
 * @param {string} options.charset - Teckenuppsättning att använda
 * @returns {Promise<string>} ASCII-representation av bilden
 */
export async function convertToAscii(imageBuffer, options = {}) {
  const { width = 80, charset = defaultCharset } = options;

  // Steg 1: Ladda bilden och hämta metadata
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  // Validera att bilden har giltiga dimensioner
  const imgWidth = metadata.width;
  const imgHeight = metadata.height;

  if (!Number.isFinite(imgWidth) || !Number.isFinite(imgHeight) ||
      imgWidth <= 0 || imgHeight <= 0) {
    throw new Error('Invalid image dimensions');
  }

  // Steg 2: Beräkna höjd med justering för teckenproportioner
  // Tecken är ungefär dubbelt så höga som breda, så vi halverar höjden
  const aspectRatio = imgHeight / imgWidth;
  const height = Math.max(1, Math.round(width * aspectRatio * 0.5));

  // Steg 3: Konvertera till gråskala och skala ner
  const { data, info } = await image
    .greyscale()                    // Konvertera till gråskala
    .resize(width, height, {        // Skala till önskad storlek
      fit: 'fill'
    })
    .raw()                          // Hämta rå pixeldata (inte PNG/JPG)
    .toBuffer({ resolveWithObject: true });

  // Steg 4: Bygg ASCII-sträng
  // 'data' är en Buffer där varje byte är ljusstyrkan (0-255) för en pixel
  let ascii = '';

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const pixelIndex = y * info.width + x;
      const brightness = data[pixelIndex];
      ascii += brightnessToChar(brightness, charset);
    }
    ascii += '\n';
  }

  return ascii;
}

/**
 * Mappar ett ljusstyrka-värde (0-255) till ett ASCII-tecken
 *
 * @param {number} brightness - Ljusstyrka 0-255 (0 = svart, 255 = vit)
 * @param {string} charset - Teckenuppsättning (mörkt till ljust)
 * @returns {string} Ett ASCII-tecken
 */
export function brightnessToChar(brightness, charset = defaultCharset) {
  // Normalisera till index i charset
  const index = Math.floor((brightness / 255) * (charset.length - 1));
  return charset[index];
}
