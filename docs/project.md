# Project Structure & Configuration

## Architecture Overview

The project is a static single-page application built with React and Vite.

```
app/                # Application source
  routes/           # Contains the single route/view component
  utils/            # Shared utilities (e.g., physics simulation, rendering logic)
  components/       # Reusable UI components (if any)
  assets/           # Static assets like images (if not in public/)
```

_Note: The initial template structure (`routes/`, `server/`) might be simplified as the project evolves into a single-view application._

## Key Configuration Files

- `vite.config.ts` - Bundler config (React, TailwindCSS plugins).
- `tailwind.config.js` - Styling customization.
- `eslint.config.js` - ESLint flat config with React/TS rules.
- `tsconfig.json` - TypeScript configuration.
- `.env` - Environment variables (if needed, copy from `.env.example`).

## Commands

Development:

```bash
npm run dev        # HMR dev server (http://localhost:5173)
npm run build      # Build static assets for deployment
npm run test       # Run tests (--watch or --coverage flags available)
npm run lint       # Run ESLint (lint:fix to auto-fix issues)
npm run format     # Run Prettier formatting
npm run typecheck  # TypeScript check
```

Deployment is handled via GitHub Actions, building the static site and deploying to GitHub Pages.

## Testing & Quality Checks

- Tests are colocated with implementation (e.g., `simulation.ts` and `simulation.test.ts`).
- Pre-commit hooks enforce typechecking, linting, and formatting.
- CI runs checks on PRs to main branch.
