// filepath: /home/joern/Documents/Projects/template-reactrouterv7-copilot/app/routes/home.test.tsx
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import Home, { meta } from './home';

// Mock the Welcome component
vi.mock('../welcome/welcome', () => ({
  Welcome: () => <div data-testid="mock-welcome">Welcome Component</div>,
}));

describe('Home', () => {
  it('renders the Welcome component using createRoutesStub', () => {
    const Stub = createRoutesStub([
      {
        path: '/home',
        Component: Home,
      },
    ]);

    render(<Stub initialEntries={['/home']} />);
    expect(screen.getByTestId('mock-welcome')).toBeInTheDocument();
  });

  describe('meta function', () => {
    it('returns the correct meta data', () => {
      const metaData = meta({} as any);

      expect(metaData).toHaveLength(2);
      expect(metaData[0]).toEqual({ title: 'New React Router App' });
      expect(metaData[1]).toEqual({
        name: 'description',
        content: 'Welcome to React Router!',
      });
    });
  });
});
