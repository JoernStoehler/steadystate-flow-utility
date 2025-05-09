import { describe, it, expect } from 'vitest';

import {
  createSimulationGrid,
  createGridFromMask,
  copySimulationGrid,
  runSimulationStep,
  runSteadyStateSimulation,
  convertForceVectorsToTargetVelocities,
} from './simulation';
import type { SimulationGrid, ForceVector, TargetVelocity, SimulationConfig } from './simulation';

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
        timeStep: 0, // Disable advection for this test
        viscosity: 0, // Disable viscosity for this test
        iterations: 1, // Just one iteration for tests
      };

      const result = runSimulationStep(grid, forces, [], testConfig);

      // Check that force was applied at the center (scaled to grid coordinates)
      const centerX = Math.floor(0.5 * 5);
      const centerY = Math.floor(0.5 * 5);

      // Force components should now be scaled by grid width/height
      expect(result.u[centerY][centerX]).toBe(1.0 * 5); // fx * width
      expect(result.v[centerY][centerX]).toBe(0.5 * 5); // fy * height
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
      const result = runSimulationStep(grid, [], []);

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
      const result = runSimulationStep(grid, [], []);

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
        timeStep: 0, // Disable advection for this test
        viscosity: 0, // Disable viscosity for this test
        iterations: 1, // Just one iteration for tests
      };

      const result = runSimulationStep(grid, [], [], testConfig);

      // Expect higher pressure at the center due to divergence
      expect(result.pressure[2][2]).not.toBe(0);
    });
  });

  describe('runSteadyStateSimulation', () => {
    it('runs multiple iterations to reach steady state', () => {
      const grid = createSimulationGrid(5, 5);

      // Set initial velocity
      grid.u[2][2] = 1.0;

      const testConfig: SimulationConfig = {
        relaxationFactor: 0.2,
        pressureImpact: 0.1,
        timeStep: 0.1,
        viscosity: 0.01,
        iterations: 3, // Run 3 iterations for the test
      };

      const result = runSteadyStateSimulation(grid, [], [], testConfig);

      // Should have evolved from initial state
      expect(result).not.toEqual(grid);

      // Verify that flow has diffused to neighboring cells due to viscosity
      expect(result.u[2][1]).not.toBe(0);
      expect(result.u[2][3]).not.toBe(0);
    });
  });

  describe('Target velocities', () => {
    it('applies target velocities with mixing weight', () => {
      const grid = createSimulationGrid(5, 5);

      // Create target velocities
      const targetVelocities: TargetVelocity[] = [
        { x: 0.5, y: 0.5, u: 0.2, v: 0.2, weight: 0.5 }, // Apply at center with 50% weight
      ];

      const testConfig: SimulationConfig = {
        relaxationFactor: 0, // Disable pressure updates for this test
        pressureImpact: 0, // Disable velocity updates from pressure
        timeStep: 0, // Disable advection for this test
        viscosity: 0, // Disable viscosity for this test
        iterations: 1, // Just one iteration for tests
      };

      // Run a single step with target velocities
      const result = runSimulationStep(grid, [], targetVelocities, testConfig);

      // Check that target velocity was applied at the center with 50% weight
      const centerX = Math.floor(0.5 * 5);
      const centerY = Math.floor(0.5 * 5);

      expect(result.u[centerY][centerX]).toBeCloseTo(0.5); // 50% of 1.0 (=0.2*5)
      expect(result.v[centerY][centerX]).toBeCloseTo(0.5); // 50% of 1.0 (=0.2*5)
    });

    it('converts force vectors to target velocities', () => {
      const forces: ForceVector[] = [{ x: 0.3, y: 0.4, fx: 1.0, fy: 2.0 }];

      // Convert with default weight (0.1)
      const targets = convertForceVectorsToTargetVelocities(forces);

      expect(targets.length).toBe(1);
      expect(targets[0].x).toBe(0.3);
      expect(targets[0].y).toBe(0.4);
      expect(targets[0].u).toBe(1.0);
      expect(targets[0].v).toBe(2.0);
      expect(targets[0].weight).toBe(0.1);

      // Convert with custom weight
      const customTargets = convertForceVectorsToTargetVelocities(forces, 0.5);
      expect(customTargets[0].weight).toBe(0.5);
    });

    it('preserves previous velocity values when using weight < 1.0', () => {
      const grid = createSimulationGrid(5, 5);

      // Set initial velocity
      grid.u[2][2] = 1.0;
      grid.v[2][2] = 1.0;

      // Create target velocities with 30% weight
      const targetVelocities: TargetVelocity[] = [{ x: 0.5, y: 0.5, u: 0.2, v: 0.0, weight: 0.3 }];

      const testConfig: SimulationConfig = {
        relaxationFactor: 0,
        pressureImpact: 0,
        timeStep: 0,
        viscosity: 0,
        iterations: 1,
      };

      // Run a single step with target velocities
      const result = runSimulationStep(grid, [], targetVelocities, testConfig);

      // Check that target velocity was mixed with existing velocity
      // u = (1-0.3)*1.0 + 0.3*(0.2*5) = 0.7 + 0.3 = 1.0
      // v = (1-0.3)*1.0 + 0.3*(0.0*5) = 0.7 + 0.0 = 0.7
      expect(result.u[2][2]).toBeCloseTo(1.0);
      expect(result.v[2][2]).toBeCloseTo(0.7);
    });

    it('properly scales target velocities to grid dimensions', () => {
      const grid = createSimulationGrid(10, 8);
      const targetVelocities: TargetVelocity[] = [
        { x: 0.4, y: 0.5, u: 0.2, v: 0.3, weight: 1.0 }, // Full weight for easy testing
      ];

      const testConfig: SimulationConfig = {
        relaxationFactor: 0,
        pressureImpact: 0,
        timeStep: 0,
        viscosity: 0,
        iterations: 1,
      };

      const result = runSimulationStep(grid, [], targetVelocities, testConfig);

      // Calculate grid position
      const gx = Math.floor(0.4 * 10);
      const gy = Math.floor(0.5 * 8);

      // Verify target velocity was scaled by grid dimensions and fully applied (weight=1.0)
      expect(result.u[gy][gx]).toBe(0.2 * 10); // target.u * width
      expect(result.v[gy][gx]).toBe(0.3 * 8); // target.v * height
    });
  });
});
