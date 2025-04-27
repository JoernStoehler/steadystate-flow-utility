import React from 'react';

import type { DisplaySettings as DisplaySettingsType } from '../types/simulation-types';
import type { SimulationGridConfig, VelocityField } from '../types/simulation-types';
import type { ForceVector } from '../utils/simulation';

import DisplaySettings from './display-settings';
import ForceVectorTable from './force-vector-table';
import SimulationSettings from './simulation-settings';
import SimulationStatus from './simulation-status';

interface SimulationControlsProps {
  obstacleMask: boolean[][] | null;
  obstacleImageData: ImageData | null;
  simulationGridConfig: SimulationGridConfig;
  setSimulationGridConfig: React.Dispatch<React.SetStateAction<SimulationGridConfig>>;
  displaySettings: DisplaySettingsType;
  setDisplaySettings: React.Dispatch<React.SetStateAction<DisplaySettingsType>>;
  forceVectors: ForceVector[];
  setForceVectors: React.Dispatch<React.SetStateAction<ForceVector[]>>;
  targetWeight: number;
  setTargetWeight: React.Dispatch<React.SetStateAction<number>>;
  isSimulating: boolean;
  velocityField: VelocityField | null;
  convergenceSteps: number | null;
  currentStep: number;
  currentDelta: number | null;
}

/**
 * Component for the right panel controls of the simulation
 */
export default function SimulationControls({
  obstacleMask,
  obstacleImageData,
  simulationGridConfig,
  setSimulationGridConfig,
  displaySettings,
  setDisplaySettings,
  forceVectors,
  setForceVectors,
  targetWeight,
  setTargetWeight,
  isSimulating,
  velocityField,
  convergenceSteps,
  currentStep,
  currentDelta,
}: SimulationControlsProps) {
  return (
    <div className="md:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3">Controls</h2>
      <p className="mb-4">Drag and drop a PNG image onto the canvas to define an obstacle.</p>
      <div className="mt-4">
        <h3 className="font-medium mb-2">Simulation Settings</h3>
        <div className="space-y-4 text-sm">
          <SimulationSettings
            simulationGridConfig={simulationGridConfig}
            setSimulationGridConfig={setSimulationGridConfig}
            targetWeight={targetWeight}
            setTargetWeight={setTargetWeight}
          />

          <DisplaySettings
            displaySettings={displaySettings}
            setDisplaySettings={setDisplaySettings}
          />

          <SimulationStatus
            isSimulating={isSimulating}
            velocityField={velocityField}
            obstacleMask={obstacleMask}
            obstacleImageData={obstacleImageData}
            convergenceSteps={convergenceSteps}
            currentStep={currentStep}
            currentDelta={currentDelta}
          />

          <ForceVectorTable
            forces={forceVectors}
            onRemoveForce={index => {
              setForceVectors(currentForces => currentForces.filter((_, i) => i !== index));
            }}
            onClearForces={() => setForceVectors([])}
            onAddForce={() => {
              // Add a default force in the middle of the canvas pointing right
              const newForce: ForceVector = {
                x: 0.2, // Near left side
                y: 0.5, // Middle height
                fx: 0.5, // Strong force to the right
                fy: 0, // No vertical force
              };
              setForceVectors(currentForces => [...currentForces, newForce]);
            }}
            onUpdateForce={(index, newForce) => {
              setForceVectors(currentForces => {
                const updatedForces = [...currentForces];
                updatedForces[index] = newForce;
                return updatedForces;
              });
            }}
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
              className={`px-4 py-2 rounded-md font-medium text-lg ${
                !obstacleMask || isSimulating || forceVectors.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
              }`}
            >
              {isSimulating ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Simulating...
                </span>
              ) : (
                'Run Simulation'
              )}
            </button>
            <p className="text-xs text-gray-600 mt-2">
              {forceVectors.length === 0
                ? 'Add target velocity vectors by clicking and dragging on the canvas'
                : `${forceVectors.length} target velocity vector(s) added`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
