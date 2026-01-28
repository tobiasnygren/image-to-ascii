/**
 * image-to-ascii API
 *
 * Startar HTTP-servern.
 */
import { serve } from '@hono/node-server';
import { createApp } from './app.js';

// API-nyckel från miljövariabel (obligatorisk)
const API_KEY = process.env.API_KEY;

if (!API_KEY || API_KEY.trim() === '') {
  console.error('Error: API_KEY environment variable is required.');
  console.error('Generate one with: openssl rand -hex 32');
  process.exit(1);
}

// Skapa appen
const app = createApp(API_KEY);

// Starta servern
const port = process.env.PORT || 3000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

export default app;
