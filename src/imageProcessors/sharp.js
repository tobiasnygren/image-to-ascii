/**
 * Image processor adapter using Sharp (for Node.js environments)
 *
 * Contract: processImage(imageBuffer, targetWidth)
 *   → { data: Uint8Array (grayscale, 1 byte per pixel), width, height }
 */
import sharp from 'sharp';

export async function processImage(imageBuffer, targetWidth) {
  if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
    throw new Error('Invalid target width');
  }

  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const imgWidth = metadata.width;
  const imgHeight = metadata.height;

  if (
    !Number.isFinite(imgWidth) ||
    !Number.isFinite(imgHeight) ||
    imgWidth <= 0 ||
    imgHeight <= 0
  ) {
    throw new Error('Invalid image dimensions');
  }

  const aspectRatio = imgHeight / imgWidth;
  const targetHeight = Math.max(1, Math.round(targetWidth * aspectRatio * 0.5));

  const { data, info } = await image
    .greyscale()
    .resize(targetWidth, targetHeight, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
}
