import { describe, it, expect } from 'vitest';

import {
  createSimulationGrid,
  createGridFromMask,
  copySimulationGrid,
  runSimulationStep,
} from './simulation';
import type { SimulationGrid, ForceVector, SimulationConfig } from './simulation';

describe('Simulation utilities', () => {
  describe('createSimulationGrid', () => {
    it('creates a grid with the specified dimensions', () => {
      const grid = createSimulationGrid(3, 2);

      expect(grid.width).toBe(3);
      expect(grid.height).toBe(2);

      // Check array dimensions
      expect(grid.pressure.length).toBe(2);
      expect(grid.pressure[0].length).toBe(3);
      expect(grid.u.length).toBe(2);
      expect(grid.u[0].length).toBe(3);
      expect(grid.v.length).toBe(2);
      expect(grid.v[0].length).toBe(3);
      expect(grid.isObstacle.length).toBe(2);
      expect(grid.isObstacle[0].length).toBe(3);

      // Check initialization values
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 3; x++) {
          expect(grid.pressure[y][x]).toBe(0);
          expect(grid.u[y][x]).toBe(0);
          expect(grid.v[y][x]).toBe(0);
          expect(grid.isObstacle[y][x]).toBe(false);
        }
      }
    });
  });

  describe('createGridFromMask', () => {
    it('creates a grid with the same dimensions as the mask', () => {
      const mask = [
        [true, false, true],
        [false, true, false],
      ];

      const grid = createGridFromMask(mask);

      expect(grid.width).toBe(3);
      expect(grid.height).toBe(2);
    });

    it('correctly copies obstacle information from the mask', () => {
      const mask = [
        [true, false, true],
        [false, true, false],
      ];

      const grid = createGridFromMask(mask);

      // Check that obstacles match the mask
      expect(grid.isObstacle).toEqual(mask);

      // Check that other arrays are zeros
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 3; x++) {
          expect(grid.pressure[y][x]).toBe(0);
          expect(grid.u[y][x]).toBe(0);
          expect(grid.v[y][x]).toBe(0);
        }
      }
    });

    it('throws an error for empty masks', () => {
      expect(() => createGridFromMask([])).toThrow();
      expect(() => createGridFromMask([[]])).toThrow();
    });
  });

  describe('copySimulationGrid', () => {
    it('creates a deep copy with the same values', () => {
      // Create and populate an original grid
      const original = createSimulationGrid(2, 2);
      original.pressure[0][0] = 1.0;
      original.pressure[0][1] = 2.0;
      original.pressure[1][0] = 3.0;
      original.pressure[1][1] = 4.0;

      original.u[0][0] = 0.1;
      original.u[0][1] = 0.2;
      original.isObstacle[1][1] = true;

      // Make a copy
      const copy = copySimulationGrid(original);

      // Check that it has the same values
      expect(copy.width).toBe(original.width);
      expect(copy.height).toBe(original.height);

      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          expect(copy.pressure[y][x]).toBe(original.pressure[y][x]);
          expect(copy.u[y][x]).toBe(original.u[y][x]);
          expect(copy.v[y][x]).toBe(original.v[y][x]);
          expect(copy.isObstacle[y][x]).toBe(original.isObstacle[y][x]);
        }
      }

      // Verify it's a deep copy by modifying the original
      original.pressure[0][0] = 99;
      expect(copy.pressure[0][0]).toBe(1.0); // Should remain unchanged
    });
  });

  describe('runSimulationStep', () => {
    it('applies forces to the velocity field', () => {
      const grid = createSimulationGrid(5, 5);
      const forces = [
        { x: 0.5, y: 0.5, fx: 1.0, fy: 0.5 }, // Apply force at center
      ];

      const testConfig: SimulationConfig = {
        relaxationFactor: 0, // Disable pressure updates for this test
        pressureImpact: 0, // Disable velocity updates from pressure
      };

      const result = runSimulationStep(grid, forces, testConfig);

      // Check that force was applied at the center (scaled to grid coordinates)
      const centerX = Math.floor(0.5 * 5);
      const centerY = Math.floor(0.5 * 5);

      expect(result.u[centerY][centerX]).toBe(1.0);
      expect(result.v[centerY][centerX]).toBe(0.5);
    });

    it('enforces zero velocity at obstacle cells', () => {
      // Create grid with an obstacle in the middle
      const mask = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, true, false, false], // Obstacle at center
        [false, false, false, false, false],
        [false, false, false, false, false],
      ];

      const grid = createGridFromMask(mask);

      // Add velocity everywhere
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          grid.u[y][x] = 1.0;
          grid.v[y][x] = 1.0;
        }
      }

      // Run a simulation step
      const result = runSimulationStep(grid, []);

      // Check that velocity is zero at the obstacle
      expect(result.u[2][2]).toBe(0);
      expect(result.v[2][2]).toBe(0);
    });

    it('enforces zero velocity at boundaries', () => {
      const grid = createSimulationGrid(5, 5);

      // Add velocity everywhere
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          grid.u[y][x] = 1.0;
          grid.v[y][x] = 1.0;
        }
      }

      // Run a simulation step
      const result = runSimulationStep(grid, []);

      // Check boundaries (top edge)
      for (let x = 0; x < grid.width; x++) {
        expect(result.u[0][x]).toBe(0);
        expect(result.v[0][x]).toBe(0);
      }

      // Check boundaries (bottom edge)
      for (let x = 0; x < grid.width; x++) {
        expect(result.u[grid.height - 1][x]).toBe(0);
        expect(result.v[grid.height - 1][x]).toBe(0);
      }

      // Check boundaries (left edge)
      for (let y = 0; y < grid.height; y++) {
        expect(result.u[y][0]).toBe(0);
        expect(result.v[y][0]).toBe(0);
      }

      // Check boundaries (right edge)
      for (let y = 0; y < grid.height; y++) {
        expect(result.u[y][grid.width - 1]).toBe(0);
        expect(result.v[y][grid.width - 1]).toBe(0);
      }
    });

    it('updates pressure based on velocity divergence', () => {
      const grid = createSimulationGrid(5, 5);

      // Create divergence by setting horizontal velocity at two points
      grid.u[2][1] = -1.0; // Flow to the left
      grid.u[2][3] = 1.0; // Flow to the right

      const testConfig: SimulationConfig = {
        relaxationFactor: 0.5,
        pressureImpact: 0, // Disable velocity updates from pressure for this test
      };

      const result = runSimulationStep(grid, [], testConfig);

      // Expect higher pressure at the center due to divergence
      expect(result.pressure[2][2]).not.toBe(0);
    });
  });
});
