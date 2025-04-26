/**
 * Core simulation data structures and algorithms for steady-state flow simulation.
 */

/**
 * Represents the primary grid used in the fluid flow simulation.
 */
export interface SimulationGrid {
  /** Width of the simulation grid */
  width: number;

  /** Height of the simulation grid */
  height: number;

  /** 2D array of pressure values at each grid cell */
  pressure: number[][];

  /** 2D array of horizontal velocity components */
  u: number[][];

  /** 2D array of vertical velocity components */
  v: number[][];

  /** 2D array indicating obstacle cells (true = cell is an obstacle) */
  isObstacle: boolean[][];
}

/**
 * Represents a force vector applied to the flow at a specific position.
 */
export interface ForceVector {
  /** X-coordinate of the force application point */
  x: number;

  /** Y-coordinate of the force application point */
  y: number;

  /** Horizontal component of the force */
  fx: number;

  /** Vertical component of the force */
  fy: number;
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
 * Configuration options for the simulation solver.
 */
export interface SimulationConfig {
  /** Relaxation factor for pressure updates (typically 0.1 to 1.0) */
  relaxationFactor: number;

  /** How strongly the velocity field is affected by pressure gradients */
  pressureImpact: number;
}

/**
 * Default configuration values for the simulation.
 */
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  relaxationFactor: 0.2,
  pressureImpact: 0.1,
};

/**
 * Runs a single iteration of the fluid simulation.
 *
 * @param grid Current state of the simulation
 * @param forces Array of force vectors to apply
 * @param config Configuration options for the simulation
 * @returns A new grid with updated pressure and velocity
 */
export function runSimulationStep(
  grid: SimulationGrid,
  forces: ForceVector[],
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): SimulationGrid {
  const { width, height, isObstacle } = grid;
  const { relaxationFactor, pressureImpact } = config;

  // Create a new grid for the updated values
  const newGrid = copySimulationGrid(grid);

  // Apply forces to the velocity field
  applyForces(newGrid, forces);

  // Update pressure based on velocity divergence
  updatePressure(newGrid, relaxationFactor);

  // Update velocity based on pressure gradient
  updateVelocity(newGrid, pressureImpact);

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
    // Convert from canvas coordinates to grid indices
    const gx = Math.floor(force.x * width);
    const gy = Math.floor(force.y * height);

    // Skip if outside the grid or on an obstacle
    if (gx < 0 || gx >= width || gy < 0 || gy >= height || isObstacle[gy][gx]) {
      continue;
    }

    // Add the force components to the velocity
    u[gy][gx] += force.fx;
    v[gy][gx] += force.fy;
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
