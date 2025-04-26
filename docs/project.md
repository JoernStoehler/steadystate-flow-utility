# Project Structure & Configuration

## Architecture Overview

The project follows a React Router v7 architecture with server-side rendering:

```
app/                # Application source
  routes/           # Route components (React Router v7)
  server/           # Server-only utilities
  welcome/          # Welcome page components
```

## Key Configuration Files

- `react-router.config.ts` - React Router v7 configuration (SSR enabled by default)
- `vite.config.ts` - Bundler config with plugins for React Router, TailwindCSS
- `eslint.config.js` - ESLint flat config with React/TS rules
- `tailwind.config.js` - Styling customization
- `.env` - Environment variables (copy from .env.example)

## Commands

Development:

```bash
npm run dev        # HMR dev server (http://localhost:5173)
npm run test       # Run tests (--watch or --coverage flags available)
npm run lint       # Run ESLint (lint:fix to auto-fix issues)
npm run format     # Run Prettier formatting
npm run typecheck  # TypeScript check
```

## Testing & Quality Checks

- Tests are colocated with implementation (e.g., `home.tsx` and `home.test.tsx`)
- Pre-commit hooks enforce typechecking, linting, and formatting
- CI runs checks on PRs to main branch
