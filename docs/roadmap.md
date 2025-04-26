# Roadmap

This roadmap outlines the development steps for the Steady-State Flow Utility. Tasks are designed to be implemented sequentially.

## Phase 1: Core Setup & Canvas (Est: 1-2 days)

- **Task 1.1: Project Cleanup & Refactoring**
  - Remove unused template directories: `app/server/` and `app/welcome/`.
  - Update imports and configurations in `app/routes.ts`, `react-router.config.ts`, and `app/root.tsx` to remove references to the deleted directories and establish a single-page structure using `app/routes/home.tsx`.
  - Check `package.json` for any template-specific dependencies that can be removed.
  - **Goal:** A clean, minimal Single Page Application (SPA) structure.
- **Task 1.2: `VisualizationCanvas` Component**
  - Create the file `app/components/visualization-canvas.tsx`.
  - Implement a functional React component that renders an HTML `<canvas>` element.
  - Define props for `width` and `height`.
  - Use `useRef` and `useEffect` to get the `CanvasRenderingContext2D` for drawing.
  - **Goal:** A reusable component to handle canvas rendering.
- **Task 1.3: Integrate Canvas into `Home` View**
  - In `app/routes/home.tsx`, import and render the `VisualizationCanvas` component.
  - Use TailwindCSS classes in `home.tsx` to create a basic layout (e.g., using flexbox or grid) with a main area for the canvas and placeholders for future UI control panels.
  - **Goal:** Display the canvas within the main application page.
- **Task 1.4: Initial State Management (`home.tsx`)**
  - In `app/routes/home.tsx`, use `useState` hooks to manage the application's core data:
    - `simulationGridConfig: { width: number, height: number }` (e.g., default `64x64`)
    - `obstacleImageData: ImageData | null` (initially `null`)
    - `obstacleMask: boolean[][] | null` (initially `null`)
    - `velocityField: { u: number[][], v: number[][] } | null` (initially `null`)
    - `forceVectors: { x: number, y: number, fx: number, fy: number }[]` (initially `[]`)
    - `displaySettings: { showMask: boolean, vectorScale: number, displayGridDensity: number }` (e.g., default `{ showMask: false, vectorScale: 1, displayGridDensity: 16 }`)
  - **Goal:** Set up the state variables needed for the visualization.

## Phase 2: Obstacle Definition (PNG -> Mask) (Est: 2-3 days)

- **Task 2.1: PNG Drag-and-Drop**
  - In `VisualizationCanvas`, add event handlers for `onDragOver` (prevent default) and `onDrop`.
  - In the `onDrop` handler: prevent default, access `event.dataTransfer.files`, read the first file using `FileReader` (`readAsDataURL`), create an `Image` object, set its `src` to the data URL, and in the `onload` callback, draw the image to a temporary canvas to get its `ImageData`.
  - Add a callback prop (e.g., `onImageLoad: (imageData: ImageData) => void`) to `VisualizationCanvas` and call it from `onDrop` to pass the `ImageData` up to `home.tsx`.
  - Update the `obstacleImageData` state in `home.tsx`.
  - **Goal:** Allow users to drop a PNG file onto the canvas and load its pixel data.
- **Task 2.2: `ImageProcessing` Utility**
  - Create the file `app/utils/image-processing.ts`.
  - Implement `export function pngToMask(imageData: ImageData, gridWidth: number, gridHeight: number): boolean[][]`.
    - Create an empty `boolean[][]` array of size `gridHeight` x `gridWidth`.
    - Iterate through each cell `(gx, gy)` of the grid.
    - Calculate the corresponding pixel coordinates `(px, py)` in the `imageData` (simple scaling: `px = gx * imageData.width / gridWidth`, `py = gy * imageData.height / gridHeight`).
    - Get the alpha value of the pixel at `(px, py)` from `imageData.data`.
    - Set `mask[gy][gx] = alpha > 128`.
  - Create `app/utils/image-processing.test.ts` and add basic unit tests for `pngToMask`.
  - **Goal:** A function to convert image data into a boolean obstacle mask based on transparency.
- **Task 2.3: Mask Generation Controls & Logic**
  - In `home.tsx`, add UI elements (e.g., `<input type="number">`) bound to the `simulationGridConfig` state variables (`width`, `height`).
  - Add a `useEffect` hook in `home.tsx` that depends on `obstacleImageData` and `simulationGridConfig`.
  - Inside the effect, if `obstacleImageData` exists, call `pngToMask` and update the `obstacleMask` state.
  - **Goal:** Trigger mask recalculation when the image or grid size changes.
- **Task 2.4: Mask/Image Visualization**
  - Create the file `app/utils/rendering.ts`.
  - Add `export function drawMask(ctx: CanvasRenderingContext2D, mask: boolean[][], canvasWidth: number, canvasHeight: number)`: Iterate through the mask, calculate cell dimensions (`cellWidth = canvasWidth / mask[0].length`, `cellHeight = canvasHeight / mask.length`), and fill rectangles with a specific color (e.g., black) where `mask[gy][gx]` is true.
  - Add `export function drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, canvasWidth: number, canvasHeight: number)`: Use `ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight)`. (Need to pass the `Image` object or its `ImageData` down).
  - In `home.tsx`, add a UI toggle (e.g., `<input type="checkbox">`) bound to `displaySettings.showMask`.
  - Modify `VisualizationCanvas` to accept `obstacleMask`, `obstacleImageData` (or the `Image` object), and `displaySettings` as props.
  - Implement a drawing function inside `VisualizationCanvas` (called via `useEffect` when relevant props change) that clears the canvas and then calls `drawImage` or `drawMask` based on `displaySettings.showMask`.
  - **Goal:** Display either the original PNG or the calculated obstacle mask on the canvas.

## Phase 3: Simulation Core (Est: 3-5 days)

- **Task 3.1: Simulation Data Structures**
  - Create the file `app/utils/simulation.ts`.
  - Define interfaces/types:
    - `interface SimulationGrid { width: number; height: number; pressure: number[][]; u: number[][]; v: number[][]; isObstacle: boolean[][]; }`
    - `interface ForceVector { x: number; y: number; fx: number; fy: number; }`
  - **Goal:** Establish clear data structures for the simulation state.
- **Task 3.2: Iterative Solver Implementation**
  - In `simulation.ts`, implement `export function runSimulationStep(grid: SimulationGrid, forces: ForceVector[]): SimulationGrid`. This function performs _one_ iteration.
    - Create copies of `u`, `v`, `pressure` arrays to store new values.
    - **Apply Forces:** Iterate through `forces`. For each force, find the nearest grid cell `(gx, gy)` and add `fx` to `newU[gy][gx]` and `fy` to `newV[gy][gx]`. (Simple injection).
    - **Update Pressure (Jacobi/Gauss-Seidel):** Iterate through non-obstacle cells. Calculate divergence (`u[x+1] - u[x] + v[y+1] - v[y]`). Update `newPressure[gy][gx]` to reduce divergence (e.g., `newPressure[gy][gx] = oldPressure[gy][gx] - relaxationFactor * divergence`).
    - **Update Velocity:** Iterate through non-obstacle cells. Update `newU` and `newV` based on the pressure gradient (e.g., `newU[gy][gx] = oldU[gy][gx] - (pressure[gx+1] - pressure[gx])`).
    - **Apply Boundary Conditions:** Iterate through all cells. If `isObstacle` is true or cell is on the outer border, set `newU`, `newV` to 0.
    - Return a new `SimulationGrid` object with the updated arrays.
  - Create `app/utils/simulation.test.ts` and add unit tests for basic scenarios (e.g., no obstacles, simple obstacle).
  - **Goal:** Implement the core logic for a single step of the fluid simulation.
- **Task 3.3: Simulation Execution Loop**
  - In `home.tsx`, add a `useEffect` hook that depends on `obstacleMask` and `forceVectors`.
  - Inside the effect:
    - If `obstacleMask` is null, return.
    - Initialize a `SimulationGrid` (zero pressure/velocity, `isObstacle` from `obstacleMask`).
    - Run a loop (e.g., `for (let i = 0; i < 100; i++)`) calling `runSimulationStep` on the grid.
    - After the loop, update the `velocityField` state with the final `u` and `v` arrays from the grid.
  - _(Optional)_ Add a `useState` boolean `isSimulating` to show a loading indicator while the loop runs.
  - **Goal:** Execute the simulation iteratively until a steady state is approximated.

## Phase 4: Vector Field Visualization (Est: 1-2 days)

- **Task 4.1: `drawVectorField` Utility**
  - In `app/utils/rendering.ts`, add `export function drawVectorField(ctx: CanvasRenderingContext2D, velocityField: { u: number[][], v: number[][] }, displayGridDensity: number, vectorScale: number, canvasWidth: number, canvasHeight: number)`.
  - Calculate step size based on `displayGridDensity` (e.g., `stepX = canvasWidth / displayGridDensity`, `stepY = canvasHeight / displayGridDensity`).
  - Loop through the display grid points `(dx, dy)`.
  - For each point, calculate the corresponding simulation grid indices `(gx, gy)`.
  - Get/interpolate the velocity `(u, v)` from `velocityField` at `(gx, gy)`.
  - Calculate the arrow end point: `endX = dx + u * vectorScale`, `endY = dy + v * vectorScale`.
  - Draw an arrow (line + arrowhead) from `(dx, dy)` to `(endX, endY)`. Use `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, `ctx.stroke()`.
  - **Goal:** A function to draw the velocity field as arrows on the canvas.
- **Task 4.2: Display Controls**
  - In `home.tsx`, add UI controls (e.g., sliders or number inputs) bound to `displaySettings.displayGridDensity` and `displaySettings.vectorScale`.
  - **Goal:** Allow users to adjust how the vector field is displayed.
- **Task 4.3: Render Vector Field**
  - Modify the drawing function in `VisualizationCanvas` to call `drawVectorField` _after_ drawing the background (mask/image), if `velocityField` is not null. Pass the necessary state (`velocityField`, `displaySettings`) as props.
  - **Goal:** Show the calculated flow arrows overlaid on the obstacle/image.

## Phase 5: Force Vector Interaction (Est: 2-4 days)

- **Task 5.1: Canvas Click+Drag for Forces**
  - In `VisualizationCanvas`, add `onMouseDown`, `onMouseMove`, `onMouseUp` handlers.
  - Use `useState` within `VisualizationCanvas` to track dragging state (`isDragging`, `startPoint {x, y}`).
  - `onMouseDown`: Set `isDragging = true`, record `startPoint`.
  - `onMouseMove`: If `isDragging`, draw a temporary line from `startPoint` to the current mouse position.
  - `onMouseUp`: If `isDragging`, calculate the vector `(fx = currentX - startX, fy = currentY - startY)`. Call a new prop function `onAddForce(force: ForceVector)` passed from `home.tsx` with `{ x: startX, y: startY, fx, fy }`. Reset dragging state.
  - Update `home.tsx` to pass the `onAddForce` callback which updates the `forceVectors` state.
  - **Goal:** Enable adding forces by clicking and dragging on the canvas.
- **Task 5.2: `ForceVectorTable` Component**
  - Create `app/components/force-vector-table.tsx`.
  - Implement a component that takes `forces: ForceVector[]`, `onAddForce: (force: ForceVector) => void`, `onDeleteForce: (index: number) => void` as props.
  - Render an HTML `<table>` displaying the `x, y, fx, fy` for each force in `forces`.
  - Add a "Delete" button for each row, calling `onDeleteForce(index)` onClick.
  - Add an extra row at the bottom with input fields for `x, y, fx, fy` and an "Add" button that calls `onAddForce` with the input values.
  - Integrate `<ForceVectorTable />` into the layout in `home.tsx`, passing the `forceVectors` state and corresponding handler functions.
  - **Goal:** Provide a table UI for viewing, adding, and deleting forces.
- **Task 5.3: Draw Force Vectors**
  - In `app/utils/rendering.ts`, add `export function drawForceVectors(ctx: CanvasRenderingContext2D, forceVectors: ForceVector[])`.
  - Iterate through `forceVectors`. For each force, draw an arrow (similar to `drawVectorField` but perhaps with a different color/style) starting at `(x, y)` representing the vector `(fx, fy)`.
  - Modify the drawing function in `VisualizationCanvas` to call `drawForceVectors` after drawing the background and velocity field.
  - **Goal:** Visually represent the applied forces on the canvas.

## Phase 6: Refinement & Deployment (Est: 2-3 days)

- **Task 6.1: UI/UX Polish:**
  - Improve layout and styling using TailwindCSS.
  - Add clear labels and instructions.
  - Implement loading indicators (e.g., during simulation).
  - Ensure controls are intuitive.
- **Task 6.2: Testing:**
  - Write React Testing Library (RTL) tests for `home.tsx` to simulate user interactions (dropping file, changing settings, adding forces).
  - Ensure good unit test coverage for utility functions (`image-processing`, `simulation`, `rendering`).
  - Run `npm run test -- --coverage`.
- **Task 6.3: Performance:**
  - Profile the application using browser dev tools, especially the simulation loop and rendering.
  - Apply optimizations _only if necessary_ (e.g., optimizing drawing calls, potentially using Web Workers for simulation if it's too slow).
- **Task 6.4: Deployment:**
  - Run `npm run build`.
  - Verify the GitHub Actions workflow correctly builds and deploys the `dist/` folder to GitHub Pages.
  - Test the deployed application.
- **Task 6.5: Documentation:**
  - Review and update `README.md` and all files in `docs/` to accurately reflect the final application state and usage. Ensure commands and descriptions are correct.

## Future Considerations (Post v1.0)

- Explore more advanced/accurate simulation methods.
- Allow saving/loading of obstacle masks and force configurations.
- Add different visualization options (e.g., streamlines).
- Improve boundary condition options.
