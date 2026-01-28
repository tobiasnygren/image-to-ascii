/**
 * Hono application for image-to-ascii API
 *
 * Separated from index.js to enable testing.
 */
import { Hono } from 'hono';
import { timingSafeEqual } from 'crypto';
import { convertToAscii } from './converter.js';

// Security configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_WIDTH = 20;
const MAX_WIDTH = 200;

/**
 * Creates and configures the Hono app
 *
 * @param {string} apiKey - API key for authentication
 * @returns {Hono} Configured Hono app
 */
export function createApp(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required');
  }

  const app = new Hono();

  // Middleware: Check API key for protected endpoints
  const requireApiKey = async (c, next) => {
    const providedKey = c.req.header('X-API-Key');

    if (!providedKey) {
      return c.json({ error: 'Missing API key. Provide it in X-API-Key header.' }, 401);
    }

    // Use timing-safe comparison to prevent timing attacks
    const keyBuffer = Buffer.from(apiKey);
    const providedBuffer = Buffer.alloc(keyBuffer.length);
    providedBuffer.write(providedKey);
    const isValidKey = timingSafeEqual(providedBuffer, keyBuffer);

    if (!isValidKey) {
      return c.json({ error: 'Invalid API key.' }, 401);
    }

    return next();
  };

  // Health check (open endpoint)
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

  // Convert image to ASCII (protected endpoint)
  app.post('/convert', requireApiKey, async (c) => {
    try {
      // 1. Get uploaded file from multipart/form-data
      const body = await c.req.parseBody();
      const file = body['image'];

      if (!file || !(file instanceof File)) {
        return c.json({ error: 'No image provided. Send a file as "image" in multipart/form-data.' }, 400);
      }

      // 2. Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return c.json({
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`
        }, 400);
      }

      // 3. Read and validate width parameter
      const parsedWidth = parseInt(c.req.query('width'), 10);
      const width = isNaN(parsedWidth)
        ? 80
        : Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsedWidth));

      // 4. Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 5. Call convertToAscii
      const ascii = await convertToAscii(buffer, { width });

      // 6. Return result
      return c.json({ ascii, width });
    } catch (error) {
      console.error('Conversion error:', error);

      // Categorize errors for more helpful messages without leaking internal info
      const message = error?.message?.toLowerCase() || '';
      const isInvalidImageError =
        message.includes('unsupported') ||
        message.includes('invalid') ||
        message.includes('decode') ||
        message.includes('corrupt');

      if (isInvalidImageError) {
        return c.json({
          error: 'Invalid or unsupported image format. Please upload a valid PNG or JPEG.'
        }, 400);
      }

      return c.json({
        error: 'Failed to process image. Please try again with a different image.'
      }, 500);
    }
  });

  return app;
}
