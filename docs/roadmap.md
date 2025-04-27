# 🚧 Roadmap

This roadmap outlines the development steps for the Steady-State Flow Utility. Tasks are designed to be implemented se- ✅ **Task 5.2: ForceVectorTable Component**  
 _(file: `app/components/force-vector-table.tsx` + integration in `home.tsx`)_

- ✅ Table of `forceVectors` with delete buttons
- ✅ "Add Force" button implemented
- 🎯 **Goal:** Force management UIally.

---

## Phase 1: Core Setup & Canvas (Est: 1–2 days)

- ✅ **Task 1.1: Project Cleanup & Refactoring**  
  _(files: `app/server/`, `app/welcome/`, `app/routes.ts`, `react-router.config.ts`, `app/root.tsx`, `package.json`)_

  - ✅ Remove unused template dirs
  - ✅ Update imports/configs to use only `app/routes/home.tsx`
  - ✅ Prune template-specific deps
  - 🎯 **Goal:** Clean, minimal SPA structure

- ✅ **Task 1.2: VisualizationCanvas Component**  
  _(file: `app/components/visualization-canvas.tsx`)_

  - ✅ Create & export the canvas component
  - ✅ Define `width` & `height` props
  - ✅ Use `useRef` + `useEffect` for 2D context
  - 🎯 **Goal:** Reusable `<canvas>` wrapper

- ✅ **Task 1.3: Integrate Canvas into Home View**  
  _(file: `app/routes/home.tsx`)_

  - ✅ Import & render `VisualizationCanvas`
  - ✅ Apply Tailwind flex/grid layout
  - 🎯 **Goal:** Canvas displayed in main view

- ✅ **Task 1.4: Initial State Management**  
  _(file: `app/routes/home.tsx`)_
  - ✅ `useState` for:
    - `simulationGridConfig: { width; height }`
    - `obstacleImageData: ImageData | null`
    - `obstacleMask: boolean[][] | null`
    - `velocityField: { u[][]; v[][] } | null`
    - `forceVectors: ForceVector[]`
    - `displaySettings: { showMask; vectorScale; displayGridDensity }`
  - 🎯 **Goal:** Core state ready

---

## Phase 2: Obstacle Definition (PNG → Mask) (Est: 2–3 days)

- ✅ **Task 2.1: PNG Drag-and-Drop**  
  _(file: `app/components/visualization-canvas.tsx`)_

  - ✅ `onDragOver`/`onDrop` handlers
  - ✅ Read file → temp canvas → `ImageData`
  - ✅ Propagate via `onImageLoad` to `home.tsx`
  - 🎯 **Goal:** Drop PNG → load pixel data

- ✅ **Task 2.2: ImageProcessing Utility**  
  _(files: `app/utils/image-processing.ts`, `app/utils/image-processing.test.ts`)_

  - ✅ Implement `pngToMask(imageData, gridW, gridH): boolean[][]`
  - ✅ Unit tests for mask logic
  - 🎯 **Goal:** Image → obstacle mask

- ✅ **Task 2.3: Mask Generation Controls & Logic**  
  _(file: `app/routes/home.tsx`)_

  - ✅ Number inputs bound to `simulationGridConfig`
  - ✅ `useEffect` to recompute mask on data/size change
  - 🎯 **Goal:** Auto-recalculate mask

- ✅ **Task 2.4: Mask/Image Visualization**  
  _(files: `app/utils/rendering.ts`, `app/routes/home.tsx`, `app/components/visualization-canvas.tsx`)_
  - ✅ `drawMask(ctx, mask, w, h)` & `drawImage(ctx, img, w, h)`
  - ✅ Toggle via `displaySettings.showMask`
  - ✅ Pass mask/image into `VisualizationCanvas`
  - 🎯 **Goal:** Show mask or PNG

---

## Phase 3: Simulation Core (Est: 3–5 days)

- ✅ **Task 3.1: Simulation Data Structures**  
  _(file: `app/utils/simulation.ts`)_

  - ✅ Define `SimulationGrid` & `ForceVector` types
  - 🎯 **Goal:** Clear data models

- ✅ **Task 3.2: Iterative Solver Implementation**  
  _(files: `app/utils/simulation.ts`, `app/utils/simulation.test.ts`)_

  - ✅ `runSimulationStep(grid, forces): SimulationGrid`
  - ✅ Apply forces, pressure solve, velocity update, boundaries
  - ✅ Unit tests for simple scenarios
  - 🎯 **Goal:** One-step solver

- ✅ **Task 3.3: Simulation Execution Loop**  
  _(file: `app/routes/home.tsx`)_

  - ✅ `useEffect` on `obstacleMask` + `forceVectors`
  - ✅ Run ~100 iterations → update `velocityField`
  - ⚙️ Optional `isSimulating` loading indicator
  - 🎯 **Goal:** Steady-state loop

- ✅ **Task 3.4: Physics Enhancements**  
  _(files: `app/utils/simulation.ts`, `app/utils/simulation.test.ts`, `docs/math.md`)_
  - ✅ Implement semi-Lagrangian advection
  - ✅ Add viscous diffusion effects
  - ✅ Create `runSteadyStateSimulation` function
  - ✅ Add new simulation parameters (timeStep, viscosity, iterations)
  - ✅ Document mathematical foundations in `math.md`
  - 🎯 **Goal:** Physically realistic and beautiful flow patterns

---

## Phase 4: Vector Field Visualization (Est: 1–2 days)

- ✅ **Task 4.1: drawVectorField Utility**  
  _(file: `app/utils/rendering.ts`)_

  - ✅ Implement `drawVectorField(ctx, velocityField, density, scale, w, h)`
  - 🎯 **Goal:** Arrow-based flow visualization

- ✅ **Task 4.2: Display Controls**  
  _(file: `app/routes/home.tsx`)_

  - ✅ Add sliders/inputs for `displayGridDensity` & `vectorScale`
  - 🎯 **Goal:** Adjustable display

- ✅ **Task 4.3: Render Vector Field**  
  _(file: `app/components/visualization-canvas.tsx`)_
  - ✅ Overlay arrows after mask/image draw
  - 🎯 **Goal:** Flow arrows on canvas

---

## Phase 5: Force Vector Interaction (Est: 2–4 days)

- ✅ **Task 5.1: Canvas Click+Drag for Forces**  
  _(file: `app/components/visualization-canvas.tsx` + `app/routes/home.tsx`)_

  - ✅ `onMouseDown`/`onMouseMove`/`onMouseUp` handlers
  - ✅ Emit new `ForceVector` via `onAddForce`
  - 🎯 **Goal:** Drag-to-add forces

- ✅ **Task 5.2: ForceVectorTable Component**  
  _(file: `app/components/force-vector-table.tsx` + integration in `home.tsx`)_

  - ✅ Table of `forceVectors` with add and delete buttons
  - 🎯 **Goal:** Force management UI

- ✅ **Task 5.3: Draw Force Vectors**  
  _(file: `app/components/visualization-canvas.tsx`)_
  - ✅ Draw each force as an arrow overlay
  - 🎯 **Goal:** Visualize applied forces

---

## Phase 6: Refinement & Deployment (Est: 2–3 days)

- 🛠️ **Task 6.1: UI/UX Polish**  
  _(various: Tailwind in components/routes)_

  - ✅ Styling, labels, instructions, loaders
  - ✅ Final UX tweaks
  - ✅ Bug fixes (simulation loop issues)

- 🛠️ **Task 6.2: Testing**  
  _(files: React Testing Library suites + `npm test`)_

  - ⬜ RTL tests for interactions
  - ✅ Unit tests for utils
  - 🛠️ Fixing test failures after refactoring
  - ⬜ Coverage run

- ⬜ **Task 6.3: Performance**  
  _(in-browser profiling)_

  - ⬜ Profile & optimize
  - ⬜ Consider Web Workers

- ✅ **Task 6.4: Deployment**  
  _(workflow: GitHub Actions, Pages)_

  - ✅ `npm run build` → verify deploy
  - ✅ GitHub Actions workflow setup
  - 🛠️ Smoke-test live

- 🛠️ **Task 6.5: Documentation**  
  _(files: `README.md`, `docs/`)_
  - 🛠️ Update usage & commands

---

## Phase 7: Advanced Simulation Controls (Est: 1-2 days)

- ⬜ **Task 7.1: Physics Parameter Controls**  
  _(file: `app/routes/home.tsx`)_

  - ⬜ Add UI controls for viscosity and timeStep
  - ⬜ Add slider for iteration count
  - ⬜ Add visualizations for different flow regimes
  - 🎯 **Goal:** User control of flow physics

- ⬜ **Task 7.2: Flow Visualization Enhancements**  
  _(files: `app/utils/rendering.ts`, `app/components/visualization-canvas.tsx`)_
  - ⬜ Add streamline visualization option
  - ⬜ Add color-coded velocity magnitude display
  - ⬜ Add pressure field visualization
  - 🎯 **Goal:** Richer visual feedback

## 🚀 Future Considerations (Post v1.0)

- ⬜ Advanced numerical solvers (multigrid, conjugate gradient)
- ⬜ Save/load simulation states (`localStorage` or backend)
- ⬜ Particle advection for streak visualization
- ⬜ Time-varying flows with animation
- ⬜ Additional boundary condition types (e.g., inflow, outflow)
- ⬜ Flow pattern analysis and statistics
- ⬜ Turbulence modeling for higher Reynolds numbers
