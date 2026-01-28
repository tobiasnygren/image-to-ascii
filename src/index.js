/**
 * image-to-ascii API
 *
 * Starts the HTTP server.
 */
import { serve } from '@hono/node-server';
import { createApp } from './app.js';

// API key from environment variable (required)
const API_KEY = process.env.API_KEY;

if (!API_KEY || API_KEY.trim() === '') {
  console.error('Error: API_KEY environment variable is required.');
  console.error('Generate one with: openssl rand -hex 32');
  process.exit(1);
}

// Create the app
const app = createApp(API_KEY);

// Start the server
const port = process.env.PORT || 3000;

serve(
  {
    fetch: app.fetch,
    port
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  }
);

export default app;
