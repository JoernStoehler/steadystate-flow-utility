// app/setupTests.ts
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Add the custom matchers
expect.extend(matchers);

// Automatically unmount and cleanup DOM between tests
afterEach(() => {
  cleanup();
});
