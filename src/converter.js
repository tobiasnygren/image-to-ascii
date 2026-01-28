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

  // TODO: Implementera konverteringslogik
  // 1. Ladda bild med sharp
  // 2. Konvertera till gråskala
  // 3. Skala till önskad bredd (justera höjd för teckenproportioner)
  // 4. Hämta pixeldata
  // 5. Mappa till ASCII-tecken
  // 6. Returnera som sträng med radbrytningar

  throw new Error('Not implemented yet');
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
