import { describe, it, expect, vi } from 'vitest';

import { drawMask } from './rendering';

describe('rendering utils', () => {
  describe('drawMask', () => {
    it('should draw a mask on the canvas', () => {
      // Create a mock canvas context
      const mockCtx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      // Create a simple 2x2 mask
      const mask = [
        [true, false],
        [false, true],
      ];

      // Call the function
      drawMask(mockCtx, mask, 100, 100);

      // Check that fillRect was called for the true values in the mask
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 50, 50); // top-left
      expect(mockCtx.fillRect).toHaveBeenCalledWith(50, 50, 50, 50); // bottom-right

      // Check that the grid lines were drawn
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });
});
