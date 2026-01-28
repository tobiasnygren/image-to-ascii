/**
 * API-tester för image-to-ascii
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { createApp } from '../src/app.js';

const TEST_API_KEY = 'test-secret-key';
const app = createApp(TEST_API_KEY);

describe('GET /', () => {
  it('returnerar API-information utan autentisering', async () => {
    const res = await app.request('/');

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.name).toBe('image-to-ascii');
    expect(json.endpoints.convert).toContain('X-API-Key');
  });
});

describe('POST /convert - autentisering', () => {
  it('returnerar 401 utan API-nyckel', async () => {
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

  it('returnerar 401 med fel API-nyckel', async () => {
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

  it('accepterar rätt API-nyckel', async () => {
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

describe('POST /convert - validering', () => {
  it('returnerar 400 utan bild', async () => {
    const res = await app.request('/convert', {
      method: 'POST',
      headers: { 'X-API-Key': TEST_API_KEY }
    });

    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('No image provided');
  });

  it('justerar width till minimum om för liten', async () => {
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
    expect(json.width).toBe(20); // Minimum är 20
  });

  it('justerar width till maximum om för stor', async () => {
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
    expect(json.width).toBe(200); // Maximum är 200
  });

  it('returnerar 400 om fil är för stor', async () => {
    // Skapa en blob som är större än 10 MB
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

  it('hanterar ogiltigt width-värde', async () => {
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
    expect(json.width).toBe(80); // Default när värde är ogiltigt
  });
});

describe('createApp', () => {
  it('kastar fel om API-nyckel saknas', () => {
    expect(() => createApp()).toThrow('API key is required');
    expect(() => createApp('')).toThrow('API key is required');
    expect(() => createApp(null)).toThrow('API key is required');
  });

  it('kastar fel om API-nyckel endast innehåller whitespace', () => {
    expect(() => createApp('   ')).toThrow('API key is required');
    expect(() => createApp('\t\n')).toThrow('API key is required');
  });
});
