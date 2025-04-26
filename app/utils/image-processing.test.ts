import { describe, it, expect } from 'vitest';

import { pngToMask } from './image-processing';

// Mock ImageData for tests
class MockImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

describe('pngToMask', () => {
  it('should create a boolean mask from image data', () => {
    // Create a mock ImageData representing a 4x4 image with some transparent/opaque pixels
    const imageData = new MockImageData(4, 4) as unknown as ImageData;
    // Set pixel values (RGBA format: each pixel is 4 bytes)
    // Make only the top-left pixel opaque (alpha = 255)
    // Format: R, G, B, A values for each pixel

    // Row 0, Column 0: Opaque
    imageData.data[0 * 4 + 3] = 255; // Alpha channel

    // All other pixels are transparent (alpha = 0) by default

    // Convert to a 2x2 grid
    const mask = pngToMask(imageData, 2, 2);

    // When mapping a 4x4 image to a 2x2 grid, each grid cell corresponds
    // to a 2x2 area in the original image. Only the top-left cell has
    // a non-transparent pixel.
    expect(mask).toEqual([
      [true, false],
      [false, false],
    ]);
  });

  it('should handle non-exact scaling ratios', () => {
    // Create a mock ImageData with a single opaque pixel in the center
    const imageData = new MockImageData(3, 3) as unknown as ImageData;

    // Center pixel (Row 1, Column 1) is opaque
    imageData.data[(1 * 3 + 1) * 4 + 3] = 255; // Alpha channel

    // Convert to a 2x2 grid (non-exact scaling)
    const mask = pngToMask(imageData, 2, 2);

    // The single opaque pixel should convert to a single true value in the mask
    expect(mask).toEqual([
      [false, false],
      [false, true], // Only bottom-right should be true
    ]);
  });
});
