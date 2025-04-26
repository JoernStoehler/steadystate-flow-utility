# Code Style Guide

## Naming & Organization

-   File naming: `kebab-case.tsx` for components, `kebab-case.ts` for utilities/logic.
-   The main view component resides in `app/routes/`.
-   Extract complex logic (physics simulation, image processing, rendering) into `app/utils/` or dedicated modules.
-   Test files are colocated with implementation: `file.ts` and `file.test.ts`.

## React Conventions

-   Prefer functional components and hooks.
-   Keep components focused and reusable where applicable.
-   Use TypeScript for props and state.

## Styling Requirements

-   Use TailwindCSS exclusively - no custom CSS except potentially minor adjustments in `app.css`.
-   Follow mobile-first responsive approach (although primary target is desktop).

## Testing Standards

-   Use TDD approach with colocated tests.
-   Testing pattern:
    ```typescript
    describe('FunctionName or ComponentName', () => {
      it('should do something specific', () => {});
    });
    ```
-   Mock external dependencies or complex calculations where necessary for unit tests.
-   Use React Testing Library (RTL) for component tests, preferring role-based selectors.
