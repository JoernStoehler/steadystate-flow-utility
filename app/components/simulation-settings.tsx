import React from 'react';

import type { SimulationGridConfig } from '../types/simulation-types';

interface SimulationSettingsProps {
  simulationGridConfig: SimulationGridConfig;
  setSimulationGridConfig: React.Dispatch<React.SetStateAction<SimulationGridConfig>>;
  targetWeight: number;
  setTargetWeight: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Component for controlling grid settings and target velocity weight
 */
export default function SimulationSettings({
  simulationGridConfig,
  setSimulationGridConfig,
  targetWeight,
  setTargetWeight,
}: SimulationSettingsProps) {
  return (
    <>
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
        <label htmlFor="target-weight" className="block mb-1">
          Target Velocity Weight:
        </label>
        <div className="flex items-center">
          <input
            id="target-weight"
            type="range"
            min="0.01"
            max="1.0"
            step="0.01"
            value={targetWeight}
            onChange={e => setTargetWeight(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="ml-2 w-12 text-right">{targetWeight.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Higher values (close to 1.0) enforce exact velocities, lower values (0.01-0.1) allow more
          natural flow.
        </p>
      </div>
    </>
  );
}
