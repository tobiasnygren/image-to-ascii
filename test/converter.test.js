/**
 * Tester för converter-modulen
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { brightnessToChar, convertToAscii } from '../src/converter.js';
import { standard, simple } from '../src/charsets.js';

describe('brightnessToChar', () => {
  it('returnerar mörkaste tecknet för värde 0', () => {
    const result = brightnessToChar(0, standard);
    expect(result).toBe('@'); // Första tecknet (mörkast)
  });

  it('returnerar ljusaste tecknet för värde 255', () => {
    const result = brightnessToChar(255, standard);
    expect(result).toBe(' '); // Sista tecknet (ljusast)
  });

  it('returnerar mellantecken för mellanvärden', () => {
    const result = brightnessToChar(128, standard);
    // Ska vara ungefär mitt i charset
    expect(standard.includes(result)).toBe(true);
  });

  it('fungerar med olika charset', () => {
    const resultSimple = brightnessToChar(0, simple);
    expect(resultSimple).toBe('@');

    const resultSimpleLight = brightnessToChar(255, simple);
    expect(resultSimpleLight).toBe(' ');
  });
});

describe('convertToAscii', () => {
  it('konverterar en svart bild till mörka tecken', async () => {
    const blackImage = readFileSync('test/fixtures/black.png');
    const result = await convertToAscii(blackImage, { width: 10 });

    // Alla tecken bör vara @ (mörkast) förutom radbrytningar
    const chars = result.replace(/\n/g, '');
    expect(chars).toMatch(/^@+$/);
  });

  it('konverterar en vit bild till ljusa tecken', async () => {
    const whiteImage = readFileSync('test/fixtures/white.png');
    const result = await convertToAscii(whiteImage, { width: 10 });

    // Alla tecken bör vara mellanslag (ljusast) förutom radbrytningar
    const chars = result.replace(/\n/g, '');
    expect(chars).toMatch(/^ +$/);
  });

  it('respekterar width-parametern', async () => {
    const image = readFileSync('test/fixtures/gradient.png');

    const narrow = await convertToAscii(image, { width: 20 });
    const wide = await convertToAscii(image, { width: 40 });

    // Första raden ska ha rätt bredd
    const narrowFirstLine = narrow.split('\n')[0];
    const wideFirstLine = wide.split('\n')[0];

    expect(narrowFirstLine.length).toBe(20);
    expect(wideFirstLine.length).toBe(40);
  });

  it('skapar gradient från mörkt till ljust', async () => {
    const gradient = readFileSync('test/fixtures/gradient.png');
    const result = await convertToAscii(gradient, { width: 20 });

    const firstLine = result.split('\n')[0];
    const firstChar = firstLine[0];
    const lastChar = firstLine[firstLine.length - 1];

    // Vänster sida ska vara mörkare (lägre index i charset)
    const firstIndex = standard.indexOf(firstChar);
    const lastIndex = standard.indexOf(lastChar);

    expect(firstIndex).toBeLessThan(lastIndex);
  });

  it('bevarar cirkelform - mörka hörn, ljus mitt', async () => {
    const circle = readFileSync('test/fixtures/circle.png');
    const result = await convertToAscii(circle, { width: 40 });
    const lines = result.split('\n').filter(line => line.length > 0);

    // Hörnen ska vara mörka (@ eller liknande)
    const topLeft = lines[0][0];
    const topRight = lines[0][lines[0].length - 1];
    const bottomLeft = lines[lines.length - 1][0];
    const bottomRight = lines[lines.length - 1][lines[0].length - 1];

    // Alla hörn ska vara bland de mörkaste tecknen (första halvan av charset)
    const darkChars = standard.slice(0, Math.floor(standard.length / 2));
    expect(darkChars).toContain(topLeft);
    expect(darkChars).toContain(topRight);
    expect(darkChars).toContain(bottomLeft);
    expect(darkChars).toContain(bottomRight);

    // Mitten ska vara ljus (cirkeln)
    const midY = Math.floor(lines.length / 2);
    const midX = Math.floor(lines[0].length / 2);
    const centerChar = lines[midY][midX];

    // Centertecknet ska vara bland de ljusaste (andra halvan av charset)
    const lightChars = standard.slice(Math.floor(standard.length / 2));
    expect(lightChars).toContain(centerChar);
  });

  it('bevarar cirkelns symmetri', async () => {
    const circle = readFileSync('test/fixtures/circle.png');
    const result = await convertToAscii(circle, { width: 40 });
    const lines = result.split('\n').filter(line => line.length > 0);

    // Jämför vänster och höger halva av mittenraden
    const midY = Math.floor(lines.length / 2);
    const midLine = lines[midY];
    const leftHalf = midLine.slice(0, Math.floor(midLine.length / 2));
    const rightHalf = midLine.slice(Math.ceil(midLine.length / 2)).split('').reverse().join('');

    // De bör vara ungefär lika (tillåt viss avvikelse pga avrundning)
    let matchingChars = 0;
    for (let i = 0; i < leftHalf.length; i++) {
      if (leftHalf[i] === rightHalf[i]) matchingChars++;
    }

    // Minst 80% av tecknen ska matcha för symmetri
    const matchRatio = matchingChars / leftHalf.length;
    expect(matchRatio).toBeGreaterThan(0.8);
  });
});
