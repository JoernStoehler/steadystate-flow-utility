# Changelog

## [Unreleased]

## [0.4.0] - 2025-04-26

- Fixed image processing to support black and white images in addition to transparent PNGs.
- Added dynamic canvas sizing to preserve image aspect ratio.
- Fixed force vector visualization to display vectors at proper scale.
- Improved force vector drawing with consistent sizing between drawing and final display.
- Enhanced display controls with support for grid densities down to 1.
- Added editable force vectors in the ForceVectorTable component.
- Fixed import statements to adhere to TypeScript verbatimModuleSyntax rules.

## [0.3.0] - 2025-04-26

- Implemented simulation core with iterative solver for steady-state flow.
- Added visualization of velocity field as vectors on the canvas.
- Created interactive force vector drawing with click and drag.
- Added ForceVectorTable component for managing simulation forces.
- Added controls for adjusting vector display parameters.
- Enhanced simulation status display.

## [0.2.0] - 2025-04-26

- Implemented basic visualization canvas with drag-and-drop support for PNG images.
- Created image processing utility to convert images to boolean obstacle masks.
- Added mask visualization and rendering capabilities.
- Added UI controls for grid size and display settings.
- Added comprehensive tests for all new components.

## [0.1.0] - 2025-04-26

- Initialized project from template.
- Updated README and documentation for flow utility goals.
- Configured React, Vite, TypeScript, TailwindCSS, ESLint, Prettier.
