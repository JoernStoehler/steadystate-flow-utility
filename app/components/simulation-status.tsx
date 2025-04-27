import React from 'react';

import type { VelocityField } from '../types/simulation-types';

interface SimulationStatusProps {
  isSimulating: boolean;
  velocityField: VelocityField | null;
  obstacleMask: boolean[][] | null;
  obstacleImageData: ImageData | null;
  convergenceSteps: number | null;
  currentStep: number;
  currentDelta: number | null;
}

/**
 * Component displaying the current status of the simulation
 */
export default function SimulationStatus({
  isSimulating,
  velocityField,
  obstacleMask,
  obstacleImageData,
  convergenceSteps,
  currentStep,
  currentDelta,
}: SimulationStatusProps) {
  return (
    <div className="mt-6">
      <p className="font-medium">Status</p>
      <div className="mt-1">
        {isSimulating ? (
          <div>
            <p className="text-blue-600 dark:text-blue-400">Running simulation...</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                <span className="font-semibold">Current iteration:</span> {currentStep}
              </p>
              {currentDelta !== null && (
                <p className="text-sm">
                  <span className="font-semibold">Current delta:</span>{' '}
                  {currentDelta.toExponential(4)}
                </p>
              )}
            </div>
          </div>
        ) : velocityField ? (
          <div>
            <p className="text-green-600 dark:text-green-400">
              Simulation complete - Flow field generated
            </p>
            {convergenceSteps !== null && (
              <p className="text-sm mt-1">
                <span className="font-semibold">Steps until convergence:</span> {convergenceSteps}
              </p>
            )}
          </div>
        ) : obstacleMask ? (
          <p className="text-green-600 dark:text-green-400">
            Obstacle mask generated ({obstacleMask.length} x {obstacleMask[0]?.length || 0})
          </p>
        ) : obstacleImageData ? (
          <p>Processing image...</p>
        ) : (
          <p className="text-gray-500">No obstacle image loaded</p>
        )}
      </div>
      <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Using Target Velocity Mode
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Vectors now control the target fluid velocity directly, rather than applying forces.
          Adjust the Target Velocity Weight to control how strongly these targets are enforced.
        </p>
      </div>
    </div>
  );
}
