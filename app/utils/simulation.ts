/**
 * Core simulation data structures and algorithms for steady-state flow simulation.
 */

/**
 * Represents the primary grid used in the fluid flow simulation.
 */
export interface SimulationGrid {
  /** Width of the simulation grid */
  width: number; // grid units

  /** Height of the simulation grid */
  height: number; // grid units

  /** 2D array of pressure values at each grid cell */
  pressure: number[][];

  /** 2D array of horizontal velocity components */
  u: number[][]; // grid units

  /** 2D array of vertical velocity components */
  v: number[][]; // grid units

  /** 2D array indicating obstacle cells (true = cell is an obstacle) */
  isObstacle: boolean[][];
}

/*
 * Unit systems:
 * - Grid: (0 - SimulationGrid.width) and (0 - SimulationGrid.height)
 * - Normalized: (0 - 1) for both x and y coordinates
 * - Pixel: (0 - canvas.width) and (0 - canvas.height)
 */

/**
 * Represents a force vector applied to the flow at a specific position.
 */
export interface ForceVector {
  /** X-coordinate of the force application point */
  x: number; // normalized units

  /** Y-coordinate of the force application point */
  y: number; // normalized units

  /** Horizontal component of the force */
  fx: number; // normalized units

  /** Vertical component of the force */
  fy: number; // normalized units
}

/**
 * Represents a target velocity applied to the flow at a specific position.
 */
export interface TargetVelocity {
  /** X-coordinate of the target velocity point */
  x: number; // normalized units

  /** Y-coordinate of the target velocity point */
  y: number; // normalized units

  /** Target horizontal velocity component */
  u: number; // normalized units

  /** Target vertical velocity component */
  v: number; // normalized units

  /** Mixing weight (0-1) controlling how strongly to enforce the target */
  weight: number;
}

/**
 * Creates a new simulation grid with the specified dimensions.
 * All values are initialized to zero, and all cells are non-obstacles.
 *
 * @param width Width of the grid
 * @param height Height of the grid
 * @returns A newly initialized SimulationGrid
 */
export function createSimulationGrid(width: number, height: number): SimulationGrid {
  return {
    width,
    height,
    pressure: Array(height)
      .fill(0)
      .map(() => Array(width).fill(0)),
    u: Array(height)
      .fill(0)
      .map(() => Array(width).fill(0)),
    v: Array(height)
      .fill(0)
      .map(() => Array(width).fill(0)),
    isObstacle: Array(height)
      .fill(0)
      .map(() => Array(width).fill(false)),
  };
}

/**
 * Creates a simulation grid from an obstacle mask.
 *
 * @param obstacleMask Boolean mask where true values represent obstacles
 * @returns A simulation grid with obstacle information from the mask
 */
export function createGridFromMask(obstacleMask: boolean[][]): SimulationGrid {
  if (obstacleMask.length === 0 || obstacleMask[0].length === 0) {
    throw new Error('Obstacle mask cannot be empty');
  }

  const height = obstacleMask.length;
  const width = obstacleMask[0].length;

  const grid = createSimulationGrid(width, height);

  // Copy the obstacle mask
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid.isObstacle[y][x] = obstacleMask[y][x];
    }
  }

  return grid;
}

/**
 * Creates a deep copy of a simulation grid.
 *
 * @param grid The grid to copy
 * @returns A new grid with all the same values
 */
export function copySimulationGrid(grid: SimulationGrid): SimulationGrid {
  const { width, height } = grid;

  const newGrid = createSimulationGrid(width, height);

  // Copy all arrays
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      newGrid.pressure[y][x] = grid.pressure[y][x];
      newGrid.u[y][x] = grid.u[y][x];
      newGrid.v[y][x] = grid.v[y][x];
      newGrid.isObstacle[y][x] = grid.isObstacle[y][x];
    }
  }

  return newGrid;
}

/**
 * Converts force vectors to target velocities for reusing the UI.
 * This allows the force vector UI to control target velocities.
 *
 * @param forces Array of force vectors
 * @param weight The mixing weight to use for all target velocities (0-1)
 * @returns Array of target velocities
 */
export function convertForceVectorsToTargetVelocities(
  forces: ForceVector[],
  weight: number = 0.1
): TargetVelocity[] {
  return forces.map(force => ({
    x: force.x,
    y: force.y,
    u: force.fx, // No need to scale here as scaling will happen in applyTargetVelocities
    v: force.fy,
    weight,
  }));
}

/**
 * Creates a new 2D array filled with zeros.
 *
 * @param width Width of the array
 * @param height Height of the array
 * @returns A new 2D array of the specified dimensions
 */
function createEmptyArray2D(width: number, height: number): number[][] {
  return Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));
}

/**
 * Performs bilinear interpolation on a 2D field at a given position.
 * Used in the semi-Lagrangian advection scheme.
 *
 * @param field The 2D field to interpolate
 * @param x X-coordinate (can be fractional)
 * @param y Y-coordinate (can be fractional)
 * @param width Width of the field
 * @param height Height of the field
 * @returns Interpolated value at the specified position
 */
function bilinearInterpolate(
  field: number[][],
  x: number,
  y: number,
  width: number,
  height: number
): number {
  // Clamp coordinates to valid range
  const clampedX = Math.max(0.5, Math.min(width - 1.5, x));
  const clampedY = Math.max(0.5, Math.min(height - 1.5, y));

  // Get integer and fractional parts
  const x0 = Math.floor(clampedX);
  const y0 = Math.floor(clampedY);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const sx = clampedX - x0;
  const sy = clampedY - y0;

  // Perform bilinear interpolation
  const val00 = field[y0][x0];
  const val10 = field[y0][x1];
  const val01 = field[y1][x0];
  const val11 = field[y1][x1];

  const val0 = val00 * (1 - sx) + val10 * sx;
  const val1 = val01 * (1 - sx) + val11 * sx;

  return val0 * (1 - sy) + val1 * sy;
}

/**
 * Configuration options for the simulation solver.
 */
export interface SimulationConfig {
  /** Relaxation factor for pressure updates (typically 0.1 to 1.0) */
  relaxationFactor: number;

  /** How strongly the velocity field is affected by pressure gradients */
  pressureImpact: number;

  /** Time step size for advection (typically 0.1 to 1.0) */
  timeStep: number;

  /** Fluid viscosity coefficient (0.001 to 0.1) */
  viscosity: number;

  /** Number of iterations to run to approach steady state */
  iterations: number;
}

/**
 * Default configuration values for the simulation.
 */
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  relaxationFactor: 0.2,
  pressureImpact: 0.1,
  timeStep: 0.1,
  viscosity: 0.01,
  iterations: 20,
};

/**
 * Runs a single iteration of the fluid simulation.
 *
 * @param grid Current state of the simulation
 * @param forces Array of force vectors to apply
 * @param targetVelocities Array of target velocities to apply (optional)
 * @param config Configuration options for the simulation
 * @returns A new grid with updated pressure and velocity
 */
export function runSimulationStep(
  grid: SimulationGrid,
  forces: ForceVector[],
  targetVelocities: TargetVelocity[] = [],
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): SimulationGrid {
  // Extract configuration parameters
  const { relaxationFactor, pressureImpact, timeStep, viscosity } = config;

  // Create a new grid for the updated values
  const newGrid = copySimulationGrid(grid);

  // Apply forces to the velocity field
  applyForces(newGrid, forces);

  // Apply advection effects
  applyAdvection(newGrid, timeStep);

  // Apply viscosity effects
  applyViscosity(newGrid, viscosity);

  // Update pressure based on velocity divergence
  updatePressure(newGrid, relaxationFactor);

  // Update velocity based on pressure gradient
  updateVelocity(newGrid, pressureImpact);

  // Apply target velocities with mixing weights
  applyTargetVelocities(newGrid, targetVelocities);

  // Apply boundary conditions
  applyBoundaryConditions(newGrid);

  return newGrid;
}

/**
 * Applies force vectors to the velocity field.
 *
 * @param grid Grid to modify
 * @param forces Array of force vectors to apply
 */
function applyForces(grid: SimulationGrid, forces: ForceVector[]): void {
  const { width, height, u, v, isObstacle } = grid;

  // Apply each force to the velocity field
  for (const force of forces) {
    // Convert from normalized coordinates (0-1) to grid indices
    const gx = Math.floor(force.x * width);
    const gy = Math.floor(force.y * height);

    // Skip if outside the grid or on an obstacle
    if (gx < 0 || gx >= width || gy < 0 || gy >= height || isObstacle[gy][gx]) {
      continue;
    }

    // Convert force components from normalized to grid units
    const scaledFx = force.fx * width;
    const scaledFy = force.fy * height;

    // Add the scaled force components to the velocity
    u[gy][gx] += scaledFx;
    v[gy][gx] += scaledFy;
  }
}

/**
 * Updates the pressure field based on velocity divergence.
 * Uses a simple Gauss-Seidel iteration to solve the Poisson equation.
 *
 * @param grid Grid to modify
 * @param relaxationFactor Controls the speed of convergence
 */
function updatePressure(grid: SimulationGrid, relaxationFactor: number): void {
  const { width, height, pressure, u, v, isObstacle } = grid;

  // Update pressure based on the divergence of the velocity field
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Skip obstacle cells
      if (isObstacle[y][x]) continue;

      // Calculate divergence
      const divergence = u[y][x + 1] - u[y][x - 1] + v[y + 1][x] - v[y - 1][x];

      // Update pressure to reduce divergence
      pressure[y][x] -= relaxationFactor * divergence;
    }
  }
}

/**
 * Updates the velocity field based on pressure gradients.
 *
 * @param grid Grid to modify
 * @param pressureImpact Controls how strongly pressure affects velocity
 */
function updateVelocity(grid: SimulationGrid, pressureImpact: number): void {
  const { width, height, pressure, u, v, isObstacle } = grid;

  // Update velocity based on pressure gradient
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Skip obstacle cells
      if (isObstacle[y][x]) continue;

      // Calculate pressure gradients
      const dpdx = pressure[y][x + 1] - pressure[y][x - 1];
      const dpdy = pressure[y + 1][x] - pressure[y - 1][x];

      // Update velocity components
      u[y][x] -= pressureImpact * dpdx;
      v[y][x] -= pressureImpact * dpdy;
    }
  }
}

/**
 * Applies advection effects to the velocity field.
 * Uses semi-Lagrangian backtracing for stability.
 *
 * @param grid Grid to modify
 * @param timeStep Time step size for advection
 */
function applyAdvection(grid: SimulationGrid, timeStep: number): void {
  const { width, height, u, v, isObstacle } = grid;
  const uNew = createEmptyArray2D(width, height);
  const vNew = createEmptyArray2D(width, height);

  // For each grid cell
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!isObstacle[y][x]) {
        // Find position where particle came from (backtrace)
        const srcX = x - u[y][x] * timeStep;
        const srcY = y - v[y][x] * timeStep;

        // Interpolate velocity at source position
        uNew[y][x] = bilinearInterpolate(u, srcX, srcY, width, height);
        vNew[y][x] = bilinearInterpolate(v, srcX, srcY, width, height);
      }
    }
  }

  // Update grid with new advected values
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!isObstacle[y][x]) {
        u[y][x] = uNew[y][x];
        v[y][x] = vNew[y][x];
      }
    }
  }
}

/**
 * Applies viscosity effects to the velocity field.
 * Implements diffusion of momentum.
 *
 * @param grid Grid to modify
 * @param viscosity Viscosity coefficient
 */
function applyViscosity(grid: SimulationGrid, viscosity: number): void {
  const { width, height, u, v, isObstacle } = grid;

  // Skip if viscosity is negligible
  if (viscosity < 0.000001) return;

  const uNew = createEmptyArray2D(width, height);
  const vNew = createEmptyArray2D(width, height);

  // For each interior grid cell
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!isObstacle[y][x]) {
        // Apply viscous diffusion using central differences (discretized Laplacian)
        const laplacianU = u[y][x + 1] + u[y][x - 1] + u[y + 1][x] + u[y - 1][x] - 4 * u[y][x];
        const laplacianV = v[y][x + 1] + v[y][x - 1] + v[y + 1][x] + v[y - 1][x] - 4 * v[y][x];

        uNew[y][x] = u[y][x] + viscosity * laplacianU;
        vNew[y][x] = v[y][x] + viscosity * laplacianV;
      }
    }
  }

  // Update grid with new viscosity-affected values
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!isObstacle[y][x]) {
        u[y][x] = uNew[y][x];
        v[y][x] = vNew[y][x];
      }
    }
  }
}

/**
 * Applies boundary conditions to the velocity field.
 * Sets zero velocity at obstacles and grid boundaries.
 *
 * @param grid Grid to modify
 */
function applyBoundaryConditions(grid: SimulationGrid): void {
  const { width, height, u, v, isObstacle } = grid;

  // Set velocity to zero at obstacles and boundaries
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Check if this is an obstacle or boundary cell
      if (isObstacle[y][x] || x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        u[y][x] = 0;
        v[y][x] = 0;
      }
    }
  }
}

/**
 * Applies target velocities to the flow field using linear mixing.
 * This creates "soft" constraints that guide the flow toward the target values.
 *
 * @param grid Grid to modify
 * @param targetVelocities Array of target velocities to apply
 */
function applyTargetVelocities(grid: SimulationGrid, targetVelocities: TargetVelocity[]): void {
  const { width, height, u, v, isObstacle } = grid;

  for (const target of targetVelocities) {
    // Convert from normalized coordinates (0-1) to grid indices
    const gx = Math.floor(target.x * width);
    const gy = Math.floor(target.y * height);

    // Skip if position is outside grid bounds or is an obstacle
    if (gx < 1 || gx >= width - 1 || gy < 1 || gy >= height - 1 || isObstacle[gy][gx]) {
      continue;
    }

    // Convert target velocity from normalized to grid units
    const scaledU = target.u * width;
    const scaledV = target.v * height;

    // Apply linear mixing between current velocity and scaled target velocity
    u[gy][gx] = (1 - target.weight) * u[gy][gx] + target.weight * scaledU;
    v[gy][gx] = (1 - target.weight) * v[gy][gx] + target.weight * scaledV;
  }
}

/**
 * Runs multiple iterations of the simulation to approach a steady state.
 *
 * @param grid Initial state of the simulation
 * @param forces Array of force vectors to apply
 * @param targetVelocities Array of target velocities to apply (optional)
 * @param config Configuration options for the simulation
 * @returns A new grid with the simulation evolved toward steady state
 */
export function runSteadyStateSimulation(
  grid: SimulationGrid,
  forces: ForceVector[],
  targetVelocities: TargetVelocity[] = [],
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): SimulationGrid {
  let currentGrid = copySimulationGrid(grid);

  // Run the specified number of iterations
  for (let i = 0; i < config.iterations; i++) {
    currentGrid = runSimulationStep(currentGrid, forces, targetVelocities, config);
  }

  return currentGrid;
}
