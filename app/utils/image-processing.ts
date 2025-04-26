/**
 * Converts an ImageData from a PNG image into a boolean obstacle mask.
 * The mask is a 2D grid where true values represent obstacle cells.
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

  // Fill the mask based on the image's alpha values
  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      // Calculate corresponding pixel coordinates in the image
      const px = Math.floor(gx * scaleX);
      const py = Math.floor(gy * scaleY);

      // Calculate the index in the imageData.data array (RGBA, 4 bytes per pixel)
      const idx = (py * imageData.width + px) * 4;

      // Get the alpha value (the 4th byte, index + 3)
      const alpha = imageData.data[idx + 3];

      // Set the mask value to true if alpha > 128 (semitransparent or opaque)
      mask[gy][gx] = alpha > 128;
    }
  }

  return mask;
}
