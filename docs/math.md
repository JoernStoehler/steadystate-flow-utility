# Mathematical Foundations of the Steady-State Flow Simulation

This document outlines the mathematical principles behind the steady-state fluid flow simulation implemented in our project, connecting mathematical concepts directly to their TypeScript implementation. The simulation incorporates the full Navier-Stokes equations for incompressible flow, including advection and viscosity effects to produce physically realistic and aesthetically pleasing flow patterns.

## Core Mathematical Representation

### Grid-Based Discretization

The simulation employs a finite difference method on a rectangular grid to solve the Navier-Stokes equations for incompressible fluid flow. The continuous domain is discretized into a grid of cells.

| Mathematical Concept                  | TypeScript Representation                                       |
| ------------------------------------- | --------------------------------------------------------------- |
| Discrete 2D grid of size $m \times n$ | `SimulationGrid` interface with `width` and `height` properties |
| Position $(i,j)$ in the grid          | Array indices `[y][x]` where $y = j$ and $x = i$                |

```typescript
export interface SimulationGrid {
  width: number; // n columns
  height: number; // m rows
  pressure: number[][];
  u: number[][];
  v: number[][];
  isObstacle: boolean[][];
}
```

## Fluid State Variables

### Pressure and Velocity Fields

The simulation tracks three primary scalar fields:

1. **Pressure Field** $P(x,y)$ - Scalar field representing fluid pressure at each point
2. **Velocity Field Components**:
   - $u(x,y)$ - Horizontal (x-direction) velocity component
   - $v(x,y)$ - Vertical (y-direction) velocity component

These continuous fields are discretized onto the grid:

| Mathematical Field | TypeScript Implementation |
| ------------------ | ------------------------- |
| $P_{i,j}$          | `pressure[j][i]`          |
| $u_{i,j}$          | `u[j][i]`                 |
| $v_{i,j}$          | `v[j][i]`                 |

## Key Equations

### 1. The Navier-Stokes Equations

The fundamental equations governing incompressible fluid flow are the Navier-Stokes equations:

$$\frac{\partial \vec{v}}{\partial t} + (\vec{v} \cdot \nabla)\vec{v} = -\frac{1}{\rho}\nabla P + \nu \nabla^2 \vec{v} + \vec{F}$$

Where:

- $\vec{v}$ is the velocity field
- $P$ is the pressure field
- $\rho$ is fluid density (set to 1 in our dimensionless implementation)
- $\nu$ is the kinematic viscosity coefficient
- $\vec{F}$ represents external forces

In component form for 2D flow:

$$\frac{\partial u}{\partial t} + u\frac{\partial u}{\partial x} + v\frac{\partial u}{\partial y} = -\frac{\partial P}{\partial x} + \nu\left(\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\right) + F_x$$

$$\frac{\partial v}{\partial t} + u\frac{\partial v}{\partial x} + v\frac{\partial v}{\partial y} = -\frac{\partial P}{\partial y} + \nu\left(\frac{\partial^2 v}{\partial x^2} + \frac{\partial^2 v}{\partial y^2}\right) + F_y$$

### 2. Incompressibility Constraint

For incompressible flow, the divergence of the velocity field must be zero:

$$\nabla \cdot \vec{v} = \frac{\partial u}{\partial x} + \frac{\partial v}{\partial y} = 0$$

In the discrete form using central differences:

$$\frac{u_{i+1,j} - u_{i-1,j}}{2\Delta x} + \frac{v_{i,j+1} - v_{i,j-1}}{2\Delta y} = 0$$

This is enforced in the code through the pressure update step, where we compute divergence:

```typescript
const divergence = u[y][x + 1] - u[y][x - 1] + v[y + 1][x] - v[y - 1][x];
```

### 2. Pressure Poisson Equation

To enforce incompressibility, we solve a Poisson equation for pressure:

$$\nabla^2 P = \frac{\partial}{\partial t}(\nabla \cdot \vec{v})$$

The simulation implements a simplified form using a relaxation method:

```typescript
pressure[y][x] -= relaxationFactor * divergence;
```

This iteratively adjusts pressure to reduce velocity divergence, effectively solving the Poisson equation using a Gauss-Seidel relaxation technique.

### 3. Advection Term

The advection term $(\vec{v} \cdot \nabla)\vec{v}$ describes how fluid carries its own momentum:

$$(\vec{v} \cdot \nabla)u = u\frac{\partial u}{\partial x} + v\frac{\partial u}{\partial y}$$
$$(\vec{v} \cdot \nabla)v = u\frac{\partial v}{\partial x} + v\frac{\partial v}{\partial y}$$

In discrete form using an upwind scheme for numerical stability:

```typescript
// Upwind discretization for advection (u component)
let advectionU = 0;
if (u[y][x] > 0) {
  advectionU = u[y][x] * (u[y][x] - u[y][x - 1]);
} else {
  advectionU = u[y][x] * (u[y][x + 1] - u[y][x]);
}

if (v[y][x] > 0) {
  advectionU += v[y][x] * (u[y][x] - u[y - 1][x]);
} else {
  advectionU += v[y][x] * (u[y + 1][x] - u[y][x]);
}
```

### 4. Viscosity Term

The viscosity term $\nu \nabla^2 \vec{v}$ models the diffusion of momentum due to molecular interactions:

$$\nu \nabla^2 u = \nu\left(\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\right)$$
$$\nu \nabla^2 v = \nu\left(\frac{\partial^2 v}{\partial x^2} + \frac{\partial^2 v}{\partial y^2}\right)$$

In discrete form using central differences:

```typescript
const viscosityU =
  viscosity *
  (u[y][x + 1] -
    2 * u[y][x] +
    u[y][x - 1] + // Second derivative in x
    u[y + 1][x] -
    2 * u[y][x] +
    u[y - 1][x]); // Second derivative in y
```

### 5. Velocity Update from Pressure Gradient

The pressure gradient influences the velocity field according to:

$$\frac{\partial \vec{v}}{\partial t} = -\frac{1}{\rho}\nabla P + \text{other terms}$$

Where $\rho$ is the fluid density (implicitly set to 1 in our simulation).

In discrete form using central differences:

$$u_{i,j}^{new} = u_{i,j}^{old} - \text{pressureImpact} \times \frac{P_{i+1,j} - P_{i-1,j}}{2\Delta x}$$
$$v_{i,j}^{new} = v_{i,j}^{old} - \text{pressureImpact} \times \frac{P_{i,j+1} - P_{i,j-1}}{2\Delta y}$$

Implemented as:

```typescript
const dpdx = pressure[y][x + 1] - pressure[y][x - 1];
const dpdy = pressure[y + 1][x] - pressure[y - 1][x];

u[y][x] -= pressureImpact * dpdx;
v[y][x] -= pressureImpact * dpdy;
```

### 6. External Forces and Target Velocities

The simulation now supports two mechanisms for controlling the fluid flow:

#### 6.1 Force Vectors

External forces ($\vec{F}$) are represented as vectors that directly impact the velocity field:

$$\frac{\partial \vec{v}}{\partial t} = \vec{F} + \text{other terms}$$

In the discrete implementation:

```typescript
export interface ForceVector {
  x: number; // position (normalized 0-1)
  y: number; // position (normalized 0-1)
  fx: number; // force magnitude in x direction
  fy: number; // force magnitude in y direction
}
```

Forces are applied by directly modifying the velocity components:

```typescript
u[gy][gx] += force.fx;
v[gy][gx] += force.fy;
```

#### 6.2 Target Velocities

Target velocities provide a mechanism to specify desired flow velocities at specific points:

```typescript
export interface TargetVelocity {
  x: number; // position (normalized 0-1)
  y: number; // position (normalized 0-1)
  u: number; // target x-velocity component
  v: number; // target y-velocity component
  weight: number; // mixing weight (0-1)
}
```

Target velocities are applied using linear mixing with a weight factor:

$$u_{i,j}^{new} = (1 - w) \times u_{i,j}^{old} + w \times u_{i,j}^{target}$$
$$v_{i,j}^{new} = (1 - w) \times v_{i,j}^{old} + w \times v_{i,j}^{target}$$

This creates a "soft" constraint that gradually guides the flow toward the target values without forcing an exact match:

```typescript
u[gy][gx] = (1 - target.weight) * u[gy][gx] + target.weight * target.u;
v[gy][gx] = (1 - target.weight) * v[gy][gx] + target.weight * target.v;
```

The weight parameter controls the strength of the constraint, allowing for flexible control:

- `weight = 1.0`: Hard constraint (velocity exactly matches target)
- `weight = 0.5`: Equal influence of target and underlying flow
- `weight = 0.1`: Subtle influence of target on the natural flow pattern

## Boundary Conditions

### No-Slip Boundary Condition

The simulation implements no-slip boundary conditions at obstacles and domain boundaries:

$$\vec{v}|_{\text{boundary}} = 0$$

This means fluid velocity at obstacle surfaces and domain edges is zero:

```typescript
if (isObstacle[y][x] || x === 0 || x === width - 1 || y === 0 || y === height - 1) {
  u[y][x] = 0;
  v[y][x] = 0;
}
```

## Numerical Solution Method

### Projection Method

The simulation employs an enhanced version of the projection method that now includes advection and viscosity effects:

1. Apply external forces to the velocity field
2. Compute advection term effects on velocity
3. Apply viscosity diffusion effects
4. Solve the pressure Poisson equation to ensure incompressibility
5. Update velocities based on the pressure field
6. Apply boundary conditions

This sequence is implemented in `runSimulationStep`:

```typescript
export function runSimulationStep(
  grid: SimulationGrid,
  forces: ForceVector[],
  targetVelocities: TargetVelocity[] = [],
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): SimulationGrid {
  // Create a new grid for the updated values
  const newGrid = copySimulationGrid(grid);

  // Apply forces to the velocity field
  applyForces(newGrid, forces);

  // Apply advection effects
  applyAdvection(newGrid, config.timeStep);

  // Apply viscosity effects
  applyViscosity(newGrid, config.viscosity);

  // Update pressure based on velocity divergence
  updatePressure(newGrid, config.relaxationFactor);

  // Update velocity based on pressure gradient
  updateVelocity(newGrid, config.pressureImpact);

  // Apply target velocities with mixing weights
  applyTargetVelocities(newGrid, targetVelocities);

  // Apply boundary conditions
  applyBoundaryConditions(newGrid);

  return newGrid;
}
```

## Configuration Parameters

### Physical and Numerical Parameters

The enhanced `SimulationConfig` interface provides parameters to control both physical behavior and numerical stability:

```typescript
export interface SimulationConfig {
  relaxationFactor: number; // controls pressure solver convergence speed (0.1-1.0)
  pressureImpact: number; // pressure gradient strength
  timeStep: number; // time step size for advection
  viscosity: number; // fluid viscosity coefficient
  iterations: number; // number of iterations to run for steady state
}
```

Where:

- `relaxationFactor` ($\omega$) controls how aggressively pressure is updated in the Poisson solver
- `pressureImpact` ($\alpha$) controls how strongly the pressure gradient affects the velocity field
- `timeStep` ($\Delta t$) affects advection stability and strength
- `viscosity` ($\nu$) controls the fluid's resistance to deformation
- `iterations` determines how many steps to run to approach steady state

Mathematically, these correspond to:

$$P_{i,j}^{new} = P_{i,j}^{old} - \omega \times \text{divergence}_{i,j}$$
$$\vec{v}_{i,j}^{new} = \vec{v}_{i,j}^{old} - \alpha \times \nabla P_{i,j}$$
$$\vec{v}_{adv} = \vec{v} - \Delta t \times (\vec{v} \cdot \nabla)\vec{v}$$
$$\vec{v}_{visc} = \vec{v} + \Delta t \times \nu \nabla^2 \vec{v}$$

## Advanced Implementation Details

### Advection Implementation

The advection step uses a semi-Lagrangian approach for stability at larger time steps:

```typescript
function applyAdvection(grid: SimulationGrid, dt: number): void {
  const { width, height, u, v } = grid;
  const uNew = createEmptyArray2D(width, height);
  const vNew = createEmptyArray2D(width, height);

  // For each grid cell
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!grid.isObstacle[y][x]) {
        // Find position where particle came from
        const srcX = x - u[y][x] * dt;
        const srcY = y - v[y][x] * dt;

        // Interpolate velocity at that position
        uNew[y][x] = bilinearInterpolate(u, srcX, srcY, width, height);
        vNew[y][x] = bilinearInterpolate(v, srcX, srcY, width, height);
      }
    }
  }

  // Update grid with new advected values
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!grid.isObstacle[y][x]) {
        u[y][x] = uNew[y][x];
        v[y][x] = vNew[y][x];
      }
    }
  }
}
```

### Viscosity Implementation

The viscosity step applies diffusion using an implicit solver:

```typescript
function applyViscosity(grid: SimulationGrid, viscosity: number): void {
  const { width, height, u, v } = grid;

  // For each interior grid cell
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!grid.isObstacle[y][x]) {
        // Apply viscous diffusion using central differences
        const laplacianU = u[y][x + 1] + u[y][x - 1] + u[y + 1][x] + u[y - 1][x] - 4 * u[y][x];
        const laplacianV = v[y][x + 1] + v[y][x - 1] + v[y + 1][x] + v[y - 1][x] - 4 * v[y][x];

        u[y][x] += viscosity * laplacianU;
        v[y][x] += viscosity * laplacianV;
      }
    }
  }
}
```

### Target Velocity Implementation

The target velocity step applies soft constraints using linear mixing:

```typescript
function applyTargetVelocities(grid: SimulationGrid, targetVelocities: TargetVelocity[]): void {
  const { width, height, u, v, isObstacle } = grid;

  for (const target of targetVelocities) {
    // Convert normalized position (0-1) to grid coordinates
    const gx = Math.round(target.x * (width - 1));
    const gy = Math.round(target.y * (height - 1));

    // Skip if position is outside grid bounds or is an obstacle
    if (gx < 1 || gx >= width - 1 || gy < 1 || gy >= height - 1 || isObstacle[gy][gx]) {
      continue;
    }

    // Apply linear mixing between current velocity and target velocity
    u[gy][gx] = (1 - target.weight) * u[gy][gx] + target.weight * target.u;
    v[gy][gx] = (1 - target.weight) * v[gy][gx] + target.weight * target.v;
  }
}
```

## Remaining Simplifications

While our enhanced simulation now includes advection and viscosity, it still employs some simplifications:

1. **Steady-State Approximation**: The simulation iteratively approaches a steady-state solution rather than focusing on accurate time evolution
2. **Simplified Projection**: The pressure projection uses a relaxation method rather than a full conjugate gradient solver
3. **Grid Resolution Limitations**: Fine flow details may be limited by grid resolution

## Aesthetic Considerations

The inclusion of advection, viscosity, and target velocities significantly enhances the visual quality and physical realism of the simulation:

1. **Vortex Shedding**: With advection included, the simulation can capture the beautiful von Kármán vortex streets that form downstream of obstacles
2. **Flow Separation**: The simulation can now exhibit flow separation effects at obstacle boundaries
3. **Reynolds Number Control**: By adjusting the viscosity parameter, different flow regimes from laminar to turbulent can be simulated
4. **Steady-State Beauty**: After running sufficient iterations, the flow stabilizes into aesthetically pleasing patterns around obstacles
5. **Flow Artistry**: Target velocities allow for artistic control of flow patterns while maintaining physical plausibility

### Visually Important Parameters

For creating the most visually stunning flows:

- **Viscosity**: Lower values (0.01-0.001) create more dynamic vortices while higher values (0.1-0.5) produce smoother, more laminar flows
- **Forces**: Strategic placement of forces can create artistic flow patterns
- **Target Velocities**: Create precise flow features like vortices and streams in specific locations
- **Mixing Weights**: Lower weight values (0.05-0.2) for target velocities preserve natural flow characteristics while guiding the overall pattern
- **Obstacle Shape**: Complex obstacle shapes create more intricate and beautiful flow patterns

## Conclusion

The enhanced simulation now provides a physically informed approximation of incompressible fluid flow with advection, viscosity, and target velocity effects. The core mathematics focuses on:

1. Maintaining the incompressibility condition ($\nabla \cdot \vec{v} = 0$)
2. Modeling momentum transport through advection ($(\vec{v} \cdot \nabla)\vec{v}$)
3. Incorporating viscous diffusion ($\nu \nabla^2 \vec{v}$)
4. Relating pressure and velocity through the pressure Poisson equation
5. Enforcing appropriate boundary conditions at obstacles
6. Providing artistic control through both force vectors and soft target velocity constraints

These mathematical principles are efficiently implemented in TypeScript, creating a balance between physical accuracy, computational performance, and artistic control ideally suited for creating beautiful, interactive flow visualizations.
