import type { ForceVector } from '../utils/simulation';

/**
 * Types for simulation state and configuration
 */

export interface SimulationGridConfig {
  width: number;
  height: number;
}

export interface VelocityField {
  u: number[][];
  v: number[][];
}

export interface DisplaySettings {
  showMask: boolean;
  vectorScale: number;
  displayGridDensity: number;
  showVelocity: boolean;
}
