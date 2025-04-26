import { useState, useEffect } from 'react';

import VisualizationCanvas from '../components/visualization-canvas';
import { pngToMask } from '../utils/image-processing';

import type { Route } from './+types/home';

// Types for our application state
interface SimulationGridConfig {
  width: number;
  height: number;
}

interface VelocityField {
  u: number[][];
  v: number[][];
}

interface ForceVector {
  x: number;
  y: number;
  fx: number;
  fy: number;
}

interface DisplaySettings {
  showMask: boolean;
  vectorScale: number;
  displayGridDensity: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Steady-State Flow Utility' },
    { name: 'description', content: 'Interactive 2D steady-state fluid flow visualization' },
  ];
}

export default function Home() {
  // Canvas dimensions for display
  const [canvasWidth] = useState(600);
  const [canvasHeight] = useState(400);

  // Core simulation state
  const [simulationGridConfig, setSimulationGridConfig] = useState<SimulationGridConfig>({
    width: 64,
    height: 64,
  });
  const [obstacleImageData, setObstacleImageData] = useState<ImageData | null>(null);
  const [obstacleMask, setObstacleMask] = useState<boolean[][] | null>(null);

  // These will be used in future phases for flow simulation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [velocityField, setVelocityField] = useState<VelocityField | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forceVectors, setForceVectors] = useState<ForceVector[]>([]);

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    showMask: false,
    vectorScale: 1,
    displayGridDensity: 16,
  });

  // Generate mask when image data or grid configuration changes
  useEffect(() => {
    if (obstacleImageData) {
      const mask = pngToMask(
        obstacleImageData,
        simulationGridConfig.width,
        simulationGridConfig.height
      );
      setObstacleMask(mask);
    }
  }, [obstacleImageData, simulationGridConfig.width, simulationGridConfig.height]);

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Steady-State Flow Utility</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <VisualizationCanvas
              width={canvasWidth}
              height={canvasHeight}
              onImageLoad={imageData => setObstacleImageData(imageData)}
              obstacleMask={obstacleMask}
              showMask={displaySettings.showMask}
            />
          </div>
        </div>
        <div className="md:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Controls</h2>
          <p className="mb-4">Drag and drop a PNG image onto the canvas to define an obstacle.</p>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Simulation Settings</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label htmlFor="grid-width" className="block mb-1">
                  Grid Width:
                </label>
                <div className="flex items-center">
                  <input
                    id="grid-width"
                    type="range"
                    min="16"
                    max="128"
                    step="8"
                    value={simulationGridConfig.width}
                    onChange={e =>
                      setSimulationGridConfig({
                        ...simulationGridConfig,
                        width: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span className="ml-2 w-8 text-right">{simulationGridConfig.width}</span>
                </div>
              </div>

              <div>
                <label htmlFor="grid-height" className="block mb-1">
                  Grid Height:
                </label>
                <div className="flex items-center">
                  <input
                    id="grid-height"
                    type="range"
                    min="16"
                    max="128"
                    step="8"
                    value={simulationGridConfig.height}
                    onChange={e =>
                      setSimulationGridConfig({
                        ...simulationGridConfig,
                        height: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span className="ml-2 w-8 text-right">{simulationGridConfig.height}</span>
                </div>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displaySettings.showMask}
                    onChange={() =>
                      setDisplaySettings({
                        ...displaySettings,
                        showMask: !displaySettings.showMask,
                      })
                    }
                    className="mr-2"
                  />
                  <span>Show Obstacle Mask</span>
                </label>
              </div>

              <div>
                <label htmlFor="vector-scale" className="block mb-1">
                  Vector Scale:
                </label>
                <div className="flex items-center">
                  <input
                    id="vector-scale"
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={displaySettings.vectorScale}
                    onChange={e =>
                      setDisplaySettings({
                        ...displaySettings,
                        vectorScale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span className="ml-2 w-12 text-right">
                    {displaySettings.vectorScale.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="font-medium">Status</p>
                <div className="mt-1">
                  {obstacleMask ? (
                    <p className="text-green-600 dark:text-green-400">
                      Obstacle mask generated ({obstacleMask.length} x{' '}
                      {obstacleMask[0]?.length || 0})
                    </p>
                  ) : obstacleImageData ? (
                    <p>Processing image...</p>
                  ) : (
                    <p className="text-gray-500">No obstacle image loaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
