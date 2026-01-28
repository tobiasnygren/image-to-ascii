/**
 * Tester för converter-modulen
 */
import { describe, it, expect } from 'vitest';
import { brightnessToChar } from '../src/converter.js';
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
  it.todo('konverterar en enkel svartvit bild');
  it.todo('respekterar width-parametern');
  it.todo('hanterar olika bildformat');
  it.todo('kastar fel för ogiltig input');
});
