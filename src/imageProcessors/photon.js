/**
 * Image processor adapter using @cf-wasm/photon (for Cloudflare Workers)
 *
 * Contract: processImage(imageBuffer, targetWidth)
 *   → { data: Uint8Array (grayscale, 1 byte per pixel), width, height }
 *
 * Note: In Cloudflare Workers, import from '@cf-wasm/photon' directly.
 * In Node.js the package resolves to the node variant automatically.
 */
import { PhotonImage, SamplingFilter, resize, grayscale } from '@cf-wasm/photon';

export async function processImage(imageBuffer, targetWidth) {
  const bytes = new Uint8Array(imageBuffer);

  let image;
  try {
    image = PhotonImage.new_from_byteslice(bytes);
  } catch {
    throw new Error('Invalid image dimensions');
  }

  const imgWidth = image.get_width();
  const imgHeight = image.get_height();

  if (!imgWidth || !imgHeight) {
    image.free();
    throw new Error('Invalid image dimensions');
  }

  const aspectRatio = imgHeight / imgWidth;
  const targetHeight = Math.max(1, Math.round(targetWidth * aspectRatio * 0.5));

  grayscale(image);
  const resized = resize(image, targetWidth, targetHeight, SamplingFilter.Lanczos3);
  image.free();

  // get_raw_pixels() returns RGBA (4 bytes per pixel).
  // After grayscale, R = G = B = brightness, so we extract the R channel.
  const rgba = resized.get_raw_pixels();
  resized.free();

  const data = new Uint8Array(targetWidth * targetHeight);
  for (let i = 0; i < data.length; i++) {
    data[i] = rgba[i * 4];
  }

  return { data, width: targetWidth, height: targetHeight };
}
