# Code Style Guide

## Naming & Organization

- File naming: `kebab-case.tsx` for components, `kebab-case.ts` for utilities
- Route components must be placed in `app/routes/` directory
- Test files are colocated with implementation: `file.ts` and `file.test.ts`

## React & Routing Conventions

- Use React Router v7 type system (`Route.LoaderFunction`, etc.)
- Always include explicit return types on loader/action functions
- Extract business logic from route components into separate modules
- Use hooks from `react-router` (`useLoaderData`, `useActionData`, etc.)

## Styling Requirements

- Use TailwindCSS exclusively - no custom CSS except in `app.css`
- Follow mobile-first responsive approach

## Testing Standards

- Use TDD approach with colocated tests
- Use `createRoutesStub` for testing route components with data APIs
- Testing pattern:
  ```typescript
  describe('ComponentName', () => {
    it('should do something specific', () => {});
  });
  ```
- Mock external resources (SVG, API calls) in tests
- Prefer RTL's role-based selectors (getByRole) over element selectors
