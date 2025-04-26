/// <reference types="vitest" />

import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  plugins: [tailwindcss(), !process.env.VITEST && reactRouter(), tsconfigPaths()],
  server: {
    port: parseInt(process.env.SERVER_PORT || '5173', 10),
    host: process.env.HOST || 'localhost',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/setupTests.ts',
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
});
