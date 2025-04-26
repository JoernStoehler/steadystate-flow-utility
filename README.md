# Steady-State Flow Utility

A simple, static single-page web application to visualize a 2D steady-state vector field around a user-defined obstacle. Hosted via GitHub Pages.

## Goal

Visualize an aesthetically pleasing vector field flowing around an obstacle. The obstacle is defined by uploading a PNG image, and the flow can be influenced by user-placed force vectors. The focus is on interactive visualization and simplicity, not numerical accuracy.

## Features

-   **Obstacle Definition:** Drag and drop a PNG image to define the obstacle shape.
-   **Mask Configuration:** UI controls to convert the PNG into a binary mask (subsampling, supersampling).
-   **Vector Field Visualization:** Displays the calculated steady-state vector field, interpolated onto a customizable sampling grid.
-   **Force Interaction:** Add, remove, or modify force vectors (start point + direction) to influence the flow.
-   **Real-time Updates:** Automatically recalculates and updates the visualization upon parameter changes.
-   **Desktop Only:** Designed for desktop browsers.

## Tech Stack

-   React
-   TypeScript
-   TailwindCSS
-   Vite (Bundler)
-   Vitest (Testing)

## Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev` (http://localhost:5173)

## Commands

-   `npm run dev`: Start HMR development server.
-   `npm run build`: Build for production (outputs to `dist/`).
-   `npm run test`: Run tests (`--watch`, `--coverage` flags available).
-   `npm run lint`: Run ESLint (`lint:fix` to auto-fix).
-   `npm run format`: Run Prettier formatting.
-   `npm run typecheck`: Run TypeScript checks.
