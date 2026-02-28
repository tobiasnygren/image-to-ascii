/**
 * Tests for image processor adapters (Sharp and Photon)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { processImage as sharpProcess } from '../src/imageProcessors/sharp.js';
import { processImage as photonProcess } from '../src/imageProcessors/photon.js';

const adapters = [
  { name: 'sharp', processImage: sharpProcess },
  { name: 'photon', processImage: photonProcess }
];

for (const { name, processImage } of adapters) {
  describe(`${name} adapter`, () => {
    it('rejects invalid targetWidth: 0', async () => {
      const imageBuffer = readFileSync('test/fixtures/black.png');
      await expect(processImage(imageBuffer, 0)).rejects.toThrow();
    });

    it('rejects invalid targetWidth: negative', async () => {
      const imageBuffer = readFileSync('test/fixtures/black.png');
      await expect(processImage(imageBuffer, -10)).rejects.toThrow();
    });

    it('rejects invalid targetWidth: NaN', async () => {
      const imageBuffer = readFileSync('test/fixtures/black.png');
      await expect(processImage(imageBuffer, NaN)).rejects.toThrow();
    });

    it('rejects invalid image data', async () => {
      const invalidBuffer = Buffer.from('not an image');
      await expect(processImage(invalidBuffer, 80)).rejects.toThrow();
    });

    it('returns correct result shape', async () => {
      const imageBuffer = readFileSync('test/fixtures/black.png');
      const result = await processImage(imageBuffer, 40);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result.data).toBeInstanceOf(Uint8Array);
    });

    it('respects targetWidth', async () => {
      const imageBuffer = readFileSync('test/fixtures/gradient.png');
      const result = await processImage(imageBuffer, 60);
      expect(result.width).toBe(60);
    });

    it('data length matches width * height', async () => {
      const imageBuffer = readFileSync('test/fixtures/black.png');
      const result = await processImage(imageBuffer, 40);
      expect(result.data.length).toBe(result.width * result.height);
    });

    it('returns grayscale values in range 0-255', async () => {
      const imageBuffer = readFileSync('test/fixtures/gradient.png');
      const { data } = await processImage(imageBuffer, 40);

      for (const value of data) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
      }
    });

    it('returns dark values for a black image', async () => {
      const imageBuffer = readFileSync('test/fixtures/black.png');
      const { data } = await processImage(imageBuffer, 20);

      for (const value of data) {
        expect(value).toBeLessThan(10);
      }
    });

    it('returns bright values for a white image', async () => {
      const imageBuffer = readFileSync('test/fixtures/white.png');
      const { data } = await processImage(imageBuffer, 20);

      for (const value of data) {
        expect(value).toBeGreaterThan(245);
      }
    });
  });
}
