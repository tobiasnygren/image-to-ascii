/**
 * Hono-applikation för image-to-ascii API
 *
 * Separerad från index.js för att möjliggöra testning.
 */
import { Hono } from 'hono';
import { convertToAscii } from './converter.js';

// Säkerhetskonfiguration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_WIDTH = 20;
const MAX_WIDTH = 200;

/**
 * Skapar och konfigurerar Hono-appen
 *
 * @param {string} apiKey - API-nyckel för autentisering
 * @returns {Hono} Konfigurerad Hono-app
 */
export function createApp(apiKey) {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const app = new Hono();

  // Middleware: Kontrollera API-nyckel för skyddade endpoints
  const requireApiKey = async (c, next) => {
    const providedKey = c.req.header('X-API-Key');

    if (!providedKey) {
      return c.json({ error: 'Missing API key. Provide it in X-API-Key header.' }, 401);
    }

    if (providedKey !== apiKey) {
      return c.json({ error: 'Invalid API key.' }, 401);
    }

    return next();
  };

  // Health check (öppen endpoint)
  app.get('/', (c) => {
    return c.json({
      name: 'image-to-ascii',
      version: '0.1.0',
      endpoints: {
        convert: 'POST /convert (requires X-API-Key header)'
      },
      limits: {
        maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024} MB`,
        widthRange: `${MIN_WIDTH}-${MAX_WIDTH} characters`
      }
    });
  });

  // Konvertera bild till ASCII (skyddad endpoint)
  app.post('/convert', requireApiKey, async (c) => {
    try {
      // 1. Hämta uppladdad fil från multipart/form-data
      const body = await c.req.parseBody();
      const file = body['image'];

      if (!file || !(file instanceof File)) {
        return c.json({ error: 'No image provided. Send a file as "image" in multipart/form-data.' }, 400);
      }

      // 2. Validera filstorlek
      if (file.size > MAX_FILE_SIZE) {
        return c.json({
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`
        }, 400);
      }

      // 3. Läs och validera width-parameter
      let width = parseInt(c.req.query('width')) || 80;
      width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));

      // 4. Konvertera File till Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 5. Anropa convertToAscii
      const ascii = await convertToAscii(buffer, { width });

      // 6. Returnera resultat
      return c.json({ ascii, width });
    } catch (error) {
      console.error('Conversion error:', error);
      // Ge inte detaljerade felmeddelanden till klienten
      return c.json({ error: 'Failed to convert image. Ensure the file is a valid image.' }, 500);
    }
  });

  return app;
}
