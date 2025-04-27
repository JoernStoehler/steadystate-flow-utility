import React from 'react';

import type { DisplaySettings as DisplaySettingsType } from '../types/simulation-types';

interface DisplaySettingsProps {
  displaySettings: DisplaySettingsType;
  setDisplaySettings: React.Dispatch<React.SetStateAction<DisplaySettingsType>>;
}

/**
 * Component for controlling display settings of the simulation
 */
export default function DisplaySettings({
  displaySettings,
  setDisplaySettings,
}: DisplaySettingsProps) {
  return (
    <>
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
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={displaySettings.showVelocity}
            onChange={() =>
              setDisplaySettings({
                ...displaySettings,
                showVelocity: !displaySettings.showVelocity,
              })
            }
            className="mr-2"
          />
          <span>Show Velocity Field</span>
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
          <span className="ml-2 w-12 text-right">{displaySettings.vectorScale.toFixed(1)}</span>
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
            min="1"
            max="32"
            step="1"
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
    </>
  );
}
