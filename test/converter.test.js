/**
 * Tests for the converter module
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { brightnessToChar, convertToAscii } from '../src/converter.js';
import { standard, simple } from '../src/charsets.js';

describe('brightnessToChar', () => {
  it('returns darkest character for value 0', () => {
    const result = brightnessToChar(0, standard);
    expect(result).toBe('@'); // First character (darkest)
  });

  it('returns lightest character for value 255', () => {
    const result = brightnessToChar(255, standard);
    expect(result).toBe(' '); // Last character (lightest)
  });

  it('returns middle character for middle values', () => {
    const result = brightnessToChar(128, standard);
    // Should be approximately in the middle of charset
    expect(standard.includes(result)).toBe(true);
  });

  it('works with different charsets', () => {
    const resultSimple = brightnessToChar(0, simple);
    expect(resultSimple).toBe('@');

    const resultSimpleLight = brightnessToChar(255, simple);
    expect(resultSimpleLight).toBe(' ');
  });
});

describe('convertToAscii', () => {
  it('converts a black image to dark characters', async () => {
    const blackImage = readFileSync('test/fixtures/black.png');
    const result = await convertToAscii(blackImage, { width: 10 });

    // All characters should be @ (darkest) except line breaks
    const chars = result.replace(/\n/g, '');
    expect(chars).toMatch(/^@+$/);
  });

  it('converts a white image to light characters', async () => {
    const whiteImage = readFileSync('test/fixtures/white.png');
    const result = await convertToAscii(whiteImage, { width: 10 });

    // All characters should be spaces (lightest) except line breaks
    const chars = result.replace(/\n/g, '');
    expect(chars).toMatch(/^ +$/);
  });

  it('respects the width parameter', async () => {
    const image = readFileSync('test/fixtures/gradient.png');

    const narrow = await convertToAscii(image, { width: 20 });
    const wide = await convertToAscii(image, { width: 40 });

    // First line should have correct width
    const narrowFirstLine = narrow.split('\n')[0];
    const wideFirstLine = wide.split('\n')[0];

    expect(narrowFirstLine.length).toBe(20);
    expect(wideFirstLine.length).toBe(40);
  });

  it('creates gradient from dark to light', async () => {
    const gradient = readFileSync('test/fixtures/gradient.png');
    const result = await convertToAscii(gradient, { width: 20 });

    const firstLine = result.split('\n')[0];
    const firstChar = firstLine[0];
    const lastChar = firstLine[firstLine.length - 1];

    // Left side should be darker (lower index in charset)
    const firstIndex = standard.indexOf(firstChar);
    const lastIndex = standard.indexOf(lastChar);

    expect(firstIndex).toBeLessThan(lastIndex);
  });

  it('preserves circle shape - dark corners, light middle', async () => {
    const circle = readFileSync('test/fixtures/circle.png');
    const result = await convertToAscii(circle, { width: 40 });
    const lines = result.split('\n').filter((line) => line.length > 0);

    // Corners should be dark (@ or similar)
    const topLeft = lines[0][0];
    const topRight = lines[0][lines[0].length - 1];
    const bottomLeft = lines[lines.length - 1][0];
    const bottomRight = lines[lines.length - 1][lines[0].length - 1];

    // All corners should be among the darkest characters (first half of charset)
    const darkChars = standard.slice(0, Math.floor(standard.length / 2));
    expect(darkChars).toContain(topLeft);
    expect(darkChars).toContain(topRight);
    expect(darkChars).toContain(bottomLeft);
    expect(darkChars).toContain(bottomRight);

    // Middle should be light (the circle)
    const midY = Math.floor(lines.length / 2);
    const midX = Math.floor(lines[0].length / 2);
    const centerChar = lines[midY][midX];

    // Center character should be among the lightest (second half of charset)
    const lightChars = standard.slice(Math.floor(standard.length / 2));
    expect(lightChars).toContain(centerChar);
  });

  it('preserves circle symmetry', async () => {
    const circle = readFileSync('test/fixtures/circle.png');
    const result = await convertToAscii(circle, { width: 40 });
    const lines = result.split('\n').filter((line) => line.length > 0);

    // Compare left and right halves of the middle line
    const midY = Math.floor(lines.length / 2);
    const midLine = lines[midY];
    const leftHalf = midLine.slice(0, Math.floor(midLine.length / 2));
    const rightHalf = midLine
      .slice(Math.ceil(midLine.length / 2))
      .split('')
      .reverse()
      .join('');

    // They should be approximately equal (allow some deviation due to rounding)
    let matchingChars = 0;
    for (let i = 0; i < leftHalf.length; i++) {
      if (leftHalf[i] === rightHalf[i]) matchingChars++;
    }

    // At least 90% of characters should match for symmetry
    // (allows some deviation due to rounding in resize)
    const matchRatio = matchingChars / leftHalf.length;
    expect(matchRatio).toBeGreaterThanOrEqual(0.9);
  });
});
