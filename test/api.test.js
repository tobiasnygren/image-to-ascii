/**
 * API tests for image-to-ascii
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { createApp } from '../src/app.js';

const TEST_API_KEY = 'test-secret-key';
const app = createApp(TEST_API_KEY);

describe('GET /', () => {
  it('returns API information without authentication', async () => {
    const res = await app.request('/');

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.name).toBe('image-to-ascii');
    expect(json.endpoints.convert).toContain('X-API-Key');
  });
});

describe('POST /convert - authentication', () => {
  it('returns 401 without API key', async () => {
    const formData = new FormData();
    formData.append('image', new Blob(['fake']), 'test.png');

    const res = await app.request('/convert', {
      method: 'POST',
      body: formData
    });

    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toContain('Missing API key');
  });

  it('returns 401 with wrong API key', async () => {
    const formData = new FormData();
    formData.append('image', new Blob(['fake']), 'test.png');

    const res = await app.request('/convert', {
      method: 'POST',
      headers: { 'X-API-Key': 'wrong-key' },
      body: formData
    });

    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toContain('Invalid API key');
  });

  it('accepts correct API key', async () => {
    const imageBuffer = readFileSync('test/fixtures/black.png');
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]), 'test.png');

    const res = await app.request('/convert', {
      method: 'POST',
      headers: { 'X-API-Key': TEST_API_KEY },
      body: formData
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ascii).toBeDefined();
  });
});

describe('POST /convert - validation', () => {
  it('returns 400 without image', async () => {
    const res = await app.request('/convert', {
      method: 'POST',
      headers: { 'X-API-Key': TEST_API_KEY }
    });

    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('No image provided');
  });

  it('adjusts width to minimum if too small', async () => {
    const imageBuffer = readFileSync('test/fixtures/black.png');
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]), 'test.png');

    const res = await app.request('/convert?width=5', {
      method: 'POST',
      headers: { 'X-API-Key': TEST_API_KEY },
      body: formData
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.width).toBe(20); // Minimum is 20
  });

  it('adjusts width to maximum if too large', async () => {
    const imageBuffer = readFileSync('test/fixtures/black.png');
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]), 'test.png');

    const res = await app.request('/convert?width=500', {
      method: 'POST',
      headers: { 'X-API-Key': TEST_API_KEY },
      body: formData
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.width).toBe(200); // Maximum is 200
  });

  it('returns 400 if file is too large', async () => {
    // Create a blob larger than 10 MB
    const largeData = new Uint8Array(11 * 1024 * 1024); // 11 MB
    const formData = new FormData();
    formData.append('image', new Blob([largeData]), 'large.png');

    const res = await app.request('/convert', {
      method: 'POST',
      headers: { 'X-API-Key': TEST_API_KEY },
      body: formData
    });

    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('too large');
  });

  it('handles invalid width value', async () => {
    const imageBuffer = readFileSync('test/fixtures/black.png');
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]), 'test.png');

    const res = await app.request('/convert?width=invalid', {
      method: 'POST',
      headers: { 'X-API-Key': TEST_API_KEY },
      body: formData
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.width).toBe(80); // Default when value is invalid
  });
});

describe('createApp', () => {
  it('throws error if API key is missing', () => {
    expect(() => createApp()).toThrow('API key is required');
    expect(() => createApp('')).toThrow('API key is required');
    expect(() => createApp(null)).toThrow('API key is required');
  });

  it('throws error if API key contains only whitespace', () => {
    expect(() => createApp('   ')).toThrow('API key is required');
    expect(() => createApp('\t\n')).toThrow('API key is required');
  });
});
