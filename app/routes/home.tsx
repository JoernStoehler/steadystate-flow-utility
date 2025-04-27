import { useState, useEffect } from 'react';

import SimulationControls from '../components/simulation-controls';
import VisualizationCanvas from '../components/visualization-canvas';
import { useSimulation } from '../hooks/use-simulation';
import type {
  SimulationGridConfig,
  DisplaySettings,
  VelocityField,
} from '../types/simulation-types';
import { pngToMask } from '../utils/image-processing';
import type { ForceVector } from '../utils/simulation';

import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Steady-State Flow Utility' },
    { name: 'description', content: 'Interactive 2D steady-state fluid flow visualization' },
  ];
}

export default function Home() {
  // Canvas dimensions for display (will adjust based on image aspect ratio)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 400 });

  // Core simulation state
  const [simulationGridConfig, setSimulationGridConfig] = useState<SimulationGridConfig>({
    width: 64,
    height: 64,
  });
  const [obstacleImageData, setObstacleImageData] = useState<ImageData | null>(null);
  const [obstacleMask, setObstacleMask] = useState<boolean[][] | null>(null);
  const [forceVectors, setForceVectors] = useState<ForceVector[]>([]);

  // Display settings
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    showMask: false,
    vectorScale: 1,
    displayGridDensity: 8,
    showVelocity: true,
  });

  // Target velocity weight (how strongly to enforce target velocities)
  const [targetWeight, setTargetWeight] = useState<number>(0.1);

  // Use the simulation hook to handle simulation logic
  const [
    { velocityField, isSimulating, convergenceSteps, currentStep, currentDelta },
    { abortSimulation },
  ] = useSimulation({
    obstacleMask,
    forceVectors,
    targetWeight,
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
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              onImageLoad={(imageData, dimensions) => {
                setObstacleImageData(imageData);
                // Update canvas dimensions to match image aspect ratio
                if (dimensions) {
                  setCanvasDimensions(dimensions);
                }
              }}
              obstacleMask={obstacleMask}
              showMask={displaySettings.showMask}
              velocityField={velocityField}
              vectorScale={displaySettings.vectorScale}
              displayGridDensity={displaySettings.displayGridDensity}
              showVelocity={displaySettings.showVelocity}
              onAddForce={force => {
                // Add the new force to the existing forces
                setForceVectors(currentForces => [...currentForces, force]);
              }}
              forceVectors={forceVectors}
            />
          </div>
        </div>
        <SimulationControls
          obstacleMask={obstacleMask}
          obstacleImageData={obstacleImageData}
          simulationGridConfig={simulationGridConfig}
          setSimulationGridConfig={setSimulationGridConfig}
          displaySettings={displaySettings}
          setDisplaySettings={setDisplaySettings}
          forceVectors={forceVectors}
          setForceVectors={setForceVectors}
          targetWeight={targetWeight}
          setTargetWeight={setTargetWeight}
          isSimulating={isSimulating}
          velocityField={velocityField}
          convergenceSteps={convergenceSteps}
          currentStep={currentStep}
          currentDelta={currentDelta}
        />
      </div>
    </main>
  );
}
