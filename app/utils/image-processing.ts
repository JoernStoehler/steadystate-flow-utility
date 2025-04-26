/**
 * Converts an ImageData from a PNG image into a boolean obstacle mask.
 * The mask is a 2D grid where true values represent obstacle cells.
 * Handles both transparent PNGs (using alpha channel) and black/white images (using grayscale).
 *
 * @param imageData The raw pixel data from the image
 * @param gridWidth The desired width of the simulation grid
 * @param gridHeight The desired height of the simulation grid
 * @returns A 2D boolean array representing the obstacle mask
 */
export function pngToMask(
  imageData: ImageData,
  gridWidth: number,
  gridHeight: number
): boolean[][] {
  // Create an empty 2D array filled with false values
  const mask: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(false));

  // Calculate scaling factors
  const scaleX = imageData.width / gridWidth;
  const scaleY = imageData.height / gridHeight;

  // The PNG might be transparent or black/white - determine which type it is
  // For black/white images, the alpha will be 255 but we need to look at the RGB values
  let hasTransparentPixels = false;
  let hasColorVariation = false;

  // Check a sample of pixels to determine image type
  const sampleSize = Math.min(1000, imageData.data.length / 4);
  for (let i = 0; i < sampleSize; i++) {
    const idx = i * 4;
    // Check alpha channel (0 = transparent)
    if (imageData.data[idx + 3] < 255) {
      hasTransparentPixels = true;
    }
    // Check if there's variation in pixel values (not just white)
    const brightness =
      (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
    if (brightness < 240) {
      // Not close to white (255)
      hasColorVariation = true;
    }

    // If we found both, no need to check more
    if (hasTransparentPixels && hasColorVariation) break;
  }

  // Fill the mask based on the appropriate image data
  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      // Calculate corresponding pixel coordinates in the image
      const px = Math.floor(gx * scaleX);
      const py = Math.floor(gy * scaleY);

      // Calculate the index in the imageData.data array (RGBA, 4 bytes per pixel)
      const idx = (py * imageData.width + px) * 4;

      // Decision logic for interpreting the image:
      // 1. If image has transparent parts, use transparency as the mask (transparent = no obstacle)
      // 2. Otherwise, use pixel darkness as the mask (black = obstacle, white = no obstacle)
      if (hasTransparentPixels) {
        // Check alpha channel (0 = transparent)
        const alpha = imageData.data[idx + 3];
        mask[gy][gx] = alpha > 128; // Non-transparent = obstacle
      } else {
        // Use pixel brightness for black and white images
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const brightness = (r + g + b) / 3;
        mask[gy][gx] = brightness < 128; // Dark/black = obstacle
      }
    }
  }

  return mask;
}
