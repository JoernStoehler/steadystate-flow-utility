import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import type { Route } from './+types/home';
import Home, { meta } from './home';

// Mock the VisualizationCanvas component
vi.mock('../components/visualization-canvas', () => ({
  default: () => <div data-testid="mock-canvas">Canvas Component</div>,
}));

describe('Home', () => {
  it('renders the visualization canvas', () => {
    const Stub = createRoutesStub([
      {
        path: '/home',
        Component: Home,
      },
    ]);

    render(<Stub initialEntries={['/home']} />);
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
  });

  describe('meta function', () => {
    it('returns the correct meta data', () => {
      // Use empty object with type assertion to Route.MetaArgs
      const metaData = meta({} as Route.MetaArgs);

      expect(metaData).toHaveLength(2);
      expect(metaData[0]).toEqual({ title: 'Steady-State Flow Utility' });
      expect(metaData[1]).toEqual({
        name: 'description',
        content: 'Interactive 2D steady-state fluid flow visualization',
      });
    });
  });
});
