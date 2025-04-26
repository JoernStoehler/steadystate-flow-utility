import { render } from '@testing-library/react';

import VisualizationCanvas from './visualization-canvas';

describe('VisualizationCanvas', () => {
  it('renders a canvas with the provided dimensions', () => {
    const { container } = render(
      <VisualizationCanvas width={400} height={300} data-testid="test-canvas" />
    );

    const canvasElement = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvasElement).toBeInTheDocument();
    expect(canvasElement.width).toBe(400);
    expect(canvasElement.height).toBe(300);
  });
});
