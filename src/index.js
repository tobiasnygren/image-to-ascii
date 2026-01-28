/**
 * image-to-ascii API
 *
 * Startar en HTTP-server som tar emot bilder och returnerar ASCII-konst.
 */
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { convertToAscii } from './converter.js';

const app = new Hono();

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'image-to-ascii',
    version: '0.1.0',
    endpoints: {
      convert: 'POST /convert'
    }
  });
});

// Konvertera bild till ASCII
app.post('/convert', async (c) => {
  try {
    // TODO: Hantera filuppladdning med Hono
    // 1. Hämta uppladdad fil från request
    // 2. Läs query-parametrar (width)
    // 3. Anropa convertToAscii
    // 4. Returnera resultat

    return c.json({ error: 'Not implemented yet' }, 501);
  } catch (error) {
    console.error('Conversion error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Starta servern
const port = process.env.PORT || 3000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

export default app;
