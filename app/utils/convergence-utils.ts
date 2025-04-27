import type { VelocityField } from '../types/simulation-types';

/**
 * Checks if the simulation has converged by comparing current and previous velocity fields
 * Returns true if the maximum difference is below the threshold
 */
export function hasConverged(
  current: VelocityField | null,
  previous: VelocityField | null,
  threshold: number = 0.001
): boolean {
  if (!current || !previous) return false;

  let maxDiff = 0;

  // Check u component differences
  for (let y = 0; y < current.u.length; y++) {
    for (let x = 0; x < current.u[y].length; x++) {
      const diff = Math.abs(current.u[y][x] - previous.u[y][x]);
      maxDiff = Math.max(maxDiff, diff);
    }
  }

  // Check v component differences
  for (let y = 0; y < current.v.length; y++) {
    for (let x = 0; x < current.v[y].length; x++) {
      const diff = Math.abs(current.v[y][x] - previous.v[y][x]);
      maxDiff = Math.max(maxDiff, diff);
    }
  }

  return maxDiff < threshold;
}
