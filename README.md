# React Router v7 Template

A modern, production-ready template for building full-stack React applications using React Router v7 with development tools optimized for fast development.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering with React Router v7
- ⚡️ Hot Module Replacement (HMR) for fast development
- 📦 Asset bundling and optimization with Vite
- 🔄 Data loading and mutations
- 🔒 TypeScript by default with strict type checking
- 🎉 TailwindCSS for styling
- 🧹 ESLint and Prettier for code quality
- 🪝 Pre-commit hooks for typechecking, linting and formatting
- 📋 EditorConfig for consistent code style
- 🌐 Environment variables management (.env) for server-side API keys
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Development Tools

For detailed development guidelines, see the [documentation](./docs/index.md).

Key commands:

```bash
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
```

Pre-commit hooks automatically enforce type checking, linting, and formatting.

## Environment Variables

Server-side API keys and sensitive data should be stored in `.env` file:

1. Copy `.env.example` to `.env`
2. Update values in `.env` with your actual credentials

**Note**: The `.env` file is git-ignored and should NEVER be committed.

## Deployment

### Manual Deployment

This template is designed for manual deployment workflows.

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
