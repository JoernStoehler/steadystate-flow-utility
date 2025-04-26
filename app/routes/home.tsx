import { useState, useEffect } from 'react';

import ForceVectorTable from '../components/force-vector-table';
import VisualizationCanvas from '../components/visualization-canvas';
import { pngToMask } from '../utils/image-processing';
import { createGridFromMask, runSimulationStep } from '../utils/simulation';
import type { ForceVector } from '../utils/simulation';

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

  const [velocityField, setVelocityField] = useState<VelocityField | null>(null);
  const [forceVectors, setForceVectors] = useState<ForceVector[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

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

  // Run the simulation when obstacle mask changes
  useEffect(() => {
    if (!obstacleMask) return;

    // Start simulation
    setIsSimulating(true);

    // Create simulation grid from mask
    const grid = createGridFromMask(obstacleMask);

    // Run simulation steps to reach steady state (use setTimeout to avoid blocking UI)
    const runSimulation = async () => {
      let currentGrid = grid;

      // Run multiple iterations to approach steady state
      for (let i = 0; i < 100; i++) {
        // Use setTimeout to allow UI updates between steps
        await new Promise(resolve => setTimeout(resolve, 0));

        // Run a simulation step
        currentGrid = runSimulationStep(currentGrid, forceVectors);
      }

      // Update velocity field with the results
      setVelocityField({
        u: currentGrid.u,
        v: currentGrid.v,
      });

      setIsSimulating(false);
    };

    runSimulation();
  }, [obstacleMask, forceVectors]);

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
              velocityField={velocityField}
              vectorScale={displaySettings.vectorScale}
              displayGridDensity={displaySettings.displayGridDensity}
              onAddForce={force => {
                // Add the new force to the existing forces
                setForceVectors(currentForces => [...currentForces, force]);
              }}
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

              <div>
                <label htmlFor="grid-density" className="block mb-1">
                  Display Grid Density:
                </label>
                <div className="flex items-center">
                  <input
                    id="grid-density"
                    type="range"
                    min="4"
                    max="32"
                    step="4"
                    value={displaySettings.displayGridDensity}
                    onChange={e =>
                      setDisplaySettings({
                        ...displaySettings,
                        displayGridDensity: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span className="ml-2 w-8 text-right">{displaySettings.displayGridDensity}</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="font-medium">Status</p>
                <div className="mt-1">
                  {isSimulating ? (
                    <p className="text-blue-600 dark:text-blue-400">Running simulation...</p>
                  ) : velocityField ? (
                    <p className="text-green-600 dark:text-green-400">
                      Simulation complete - Flow field generated
                    </p>
                  ) : obstacleMask ? (
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

              <ForceVectorTable
                forces={forceVectors}
                onRemoveForce={index => {
                  setForceVectors(currentForces => currentForces.filter((_, i) => i !== index));
                }}
                onClearForces={() => setForceVectors([])}
              />

              <div className="mt-6">
                <button
                  onClick={() => {
                    // Run the simulation with current forces and mask
                    if (obstacleMask && forceVectors.length > 0) {
                      // Re-run the simulation effect by creating a new array instance
                      // This triggers the useEffect that depends on forceVectors
                      setForceVectors([...forceVectors]);
                    }
                  }}
                  disabled={!obstacleMask || isSimulating || forceVectors.length === 0}
                  className={`px-4 py-2 rounded-md font-medium ${
                    !obstacleMask || isSimulating || forceVectors.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSimulating ? 'Simulating...' : 'Run Simulation'}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  {forceVectors.length === 0
                    ? 'Add force vectors by clicking and dragging on the canvas'
                    : `${forceVectors.length} force vector(s) added`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
