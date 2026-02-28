/**
 * Rigorous benchmark: Sharp vs @cf-wasm/photon adapters
 *
 * Controls for:
 *  - Warm-up (10 calls before measurement)
 *  - Order randomization per image (removes file-cache bias)
 *  - Multiple image sizes (100×100, 500×500, 2000×2000)
 *  - Statistics: mean, min, max, stddev
 *
 * Run with: node benchmarks/benchmark-adapters.js
 */
import sharp from 'sharp';
import { processImage as sharpProcess } from '../src/imageProcessors/sharp.js';
import { processImage as photonProcess } from '../src/imageProcessors/photon.js';

const WARMUP = 10;
const RUNS = 50;
const TARGET_WIDTH = 80;

// --- Test image generation ---

async function makeGradient(size) {
  const pixels = Buffer.alloc(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) pixels[y * size + x] = Math.round((x / (size - 1)) * 255);
  return sharp(pixels, { raw: { width: size, height: size, channels: 1 } })
    .png()
    .toBuffer();
}

// --- Statistics ---

function stats(times) {
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((a, b) => a + (b - mean) ** 2, 0) / times.length;
  return {
    mean,
    min: Math.min(...times),
    max: Math.max(...times),
    stddev: Math.sqrt(variance)
  };
}

function fmt(s) {
  return `${s.mean.toFixed(2)} ms  (min ${s.min.toFixed(2)}, max ${s.max.toFixed(2)}, σ ${s.stddev.toFixed(2)})`;
}

// --- Benchmark runner ---

async function benchmark(name, buf) {
  // Warm-up both adapters equally before measuring either
  for (let i = 0; i < WARMUP; i++) {
    await sharpProcess(buf, TARGET_WIDTH);
    await photonProcess(buf, TARGET_WIDTH);
  }

  // Collect timings, alternating which adapter goes first on each run
  const sharpTimes = [];
  const photonTimes = [];

  for (let i = 0; i < RUNS; i++) {
    if (i % 2 === 0) {
      // Sharp first
      let t = performance.now();
      await sharpProcess(buf, TARGET_WIDTH);
      sharpTimes.push(performance.now() - t);

      t = performance.now();
      await photonProcess(buf, TARGET_WIDTH);
      photonTimes.push(performance.now() - t);
    } else {
      // Photon first
      let t = performance.now();
      await photonProcess(buf, TARGET_WIDTH);
      photonTimes.push(performance.now() - t);

      t = performance.now();
      await sharpProcess(buf, TARGET_WIDTH);
      sharpTimes.push(performance.now() - t);
    }
  }

  const ss = stats(sharpTimes);
  const ps = stats(photonTimes);
  const ratio = ss.mean / ps.mean;

  console.log(`\n${name}`);
  console.log(`  Sharp:  ${fmt(ss)}`);
  console.log(`  Photon: ${fmt(ps)}`);

  if (ratio > 1.1) {
    console.log(`  → Photon is ×${ratio.toFixed(1)} faster`);
  } else if (ratio < 0.9) {
    console.log(`  → Sharp is ×${(1 / ratio).toFixed(1)} faster`);
  } else {
    console.log(`  → Roughly equal (ratio: ${ratio.toFixed(2)})`);
  }
}

// --- Main ---

console.log(
  `Benchmark: ${WARMUP} warm-up + ${RUNS} measured runs, alternating order, width=${TARGET_WIDTH}\n`
);
console.log('─'.repeat(72));

const sizes = [100, 500, 2000];
for (const size of sizes) {
  const buf = await makeGradient(size);
  await benchmark(`gradient ${size}×${size}`, buf);
}

console.log('\n' + '─'.repeat(72));
