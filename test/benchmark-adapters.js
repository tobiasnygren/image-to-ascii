/**
 * Benchmarks Sharp vs @cf-wasm/photon adapters.
 * Measures both performance and visual similarity of the ASCII output.
 *
 * Run with: node test/benchmark-adapters.js
 */
import { readFileSync } from 'fs';
import { processImage as sharpProcess } from '../src/imageProcessors/sharp.js';
import { processImage as photonProcess } from '../src/imageProcessors/photon.js';
import { convertToAscii } from '../src/converter.js';

const IMAGES = ['gradient', 'circle', 'black', 'white'];
const WIDTH = 80;
const RUNS = 10;

// --- Helpers ---

async function measure(fn, runs) {
  // Warm-up
  await fn();
  const start = performance.now();
  for (let i = 0; i < runs; i++) await fn();
  return (performance.now() - start) / runs;
}

function similarityScore(a, b) {
  const len = Math.min(a.length, b.length);
  let matching = 0;
  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) matching++;
  }
  return (matching / len) * 100;
}

function pixelDiff(dataA, dataB) {
  const len = Math.min(dataA.length, dataB.length);
  let totalDiff = 0;
  for (let i = 0; i < len; i++) {
    totalDiff += Math.abs(dataA[i] - dataB[i]);
  }
  return totalDiff / len;
}

// --- Main ---

console.log(`Adapter benchmark — ${RUNS} runs per image, width=${WIDTH}\n`);
console.log('─'.repeat(72));

for (const name of IMAGES) {
  const buf = readFileSync(`test/fixtures/${name}.png`);

  const sharpMs = await measure(() => sharpProcess(buf, WIDTH), RUNS);
  const photonMs = await measure(() => photonProcess(buf, WIDTH), RUNS);

  // Pixel-level comparison
  const sharpResult = await sharpProcess(buf, WIDTH);
  const photonResult = await photonProcess(buf, WIDTH);
  const avgPixelDiff = pixelDiff(sharpResult.data, photonResult.data);

  // ASCII output comparison (uses Sharp adapter via converter.js)
  const sharpAscii = await convertToAscii(buf, { width: WIDTH });

  // Temporarily use photon by calling processImage directly + same ASCII logic
  const { data, width: w, height: h } = photonResult;
  const { brightnessToChar } = await import('../src/converter.js');
  const { standard } = await import('../src/charsets.js');
  const chars = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) chars.push(brightnessToChar(data[y * w + x], standard));
    chars.push('\n');
  }
  const photonAscii = chars.join('');

  const similarity = similarityScore(sharpAscii, photonAscii);
  const ratio = photonMs / sharpMs;

  console.log(`\n${name}.png`);
  console.log(
    `  Sharp:    ${sharpMs.toFixed(2)} ms  (${sharpResult.width}×${sharpResult.height} px)`
  );
  console.log(
    `  Photon:   ${photonMs.toFixed(2)} ms  (${photonResult.width}×${photonResult.height} px)`
  );
  console.log(`  Slowdown: ×${ratio.toFixed(1)}`);
  console.log(`  Avg pixel diff (0-255): ${avgPixelDiff.toFixed(2)}`);
  console.log(`  ASCII similarity: ${similarity.toFixed(1)}%`);
}

console.log('\n' + '─'.repeat(72));
