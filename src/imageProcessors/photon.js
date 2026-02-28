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
  if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
    throw new Error('Invalid target width');
  }

  const bytes = new Uint8Array(imageBuffer);

  let image;
  try {
    image = PhotonImage.new_from_byteslice(bytes);
  } catch (err) {
    throw new Error(`Failed to decode image: ${err.message}`);
  }

  const imgWidth = image.get_width();
  const imgHeight = image.get_height();

  if (
    !Number.isFinite(imgWidth) ||
    !Number.isFinite(imgHeight) ||
    imgWidth <= 0 ||
    imgHeight <= 0
  ) {
    image.free();
    throw new Error('Invalid image dimensions');
  }

  const aspectRatio = imgHeight / imgWidth;
  const targetHeight = Math.max(1, Math.round(targetWidth * aspectRatio * 0.5));

  grayscale(image);

  let resized;
  try {
    resized = resize(image, targetWidth, targetHeight, SamplingFilter.Lanczos3);
  } finally {
    image.free();
  }

  // get_raw_pixels() returns RGBA (4 bytes per pixel).
  // After grayscale, R = G = B = brightness, so we extract the R channel.
  let rgba;
  let actualWidth, actualHeight;
  try {
    rgba = resized.get_raw_pixels();
    actualWidth = resized.get_width();
    actualHeight = resized.get_height();
  } finally {
    resized.free();
  }

  const data = new Uint8Array(actualWidth * actualHeight);
  for (let i = 0; i < data.length; i++) {
    data[i] = rgba[i * 4];
  }

  return { data, width: actualWidth, height: actualHeight };
}
