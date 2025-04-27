import { useState, useEffect, useRef } from 'react';

import type { VelocityField } from '../types/simulation-types';
import { hasConverged } from '../utils/convergence-utils';
import {
  createGridFromMask,
  runSimulationStep,
  convertForceVectorsToTargetVelocities,
  type ForceVector,
} from '../utils/simulation';

interface SimulationState {
  velocityField: VelocityField | null;
  isSimulating: boolean;
  convergenceSteps: number | null;
  currentStep: number;
  currentDelta: number | null;
}

interface UseSimulationParams {
  obstacleMask: boolean[][] | null;
  forceVectors: ForceVector[];
  targetWeight: number;
}

/**
 * Custom hook to manage the simulation state and logic
 */
export function useSimulation({ obstacleMask, forceVectors, targetWeight }: UseSimulationParams): [
  SimulationState,
  {
    abortSimulation: () => void;
  },
] {
  const [velocityField, setVelocityField] = useState<VelocityField | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [convergenceSteps, setConvergenceSteps] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentDelta, setCurrentDelta] = useState<number | null>(null);

  // Use ref for abort controller to avoid dependency cycle
  const abortControllerRef = useRef<AbortController | null>(null);

  // Run the simulation when obstacle mask changes
  useEffect(() => {
    if (!obstacleMask) return;

    // Abort any previous simulation first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller for this simulation run
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Start simulation
    setIsSimulating(true);
    setConvergenceSteps(null);
    setCurrentStep(0);
    setCurrentDelta(null);

    // Create simulation grid from mask
    const grid = createGridFromMask(obstacleMask);

    // Run simulation steps to reach steady state (use setTimeout to avoid blocking UI)
    const runSimulation = async () => {
      // Handle case where the simulation is aborted before it starts
      if (controller.signal.aborted) {
        setIsSimulating(false);
        return;
      }

      let currentGrid = grid;
      let previousVelocityField: VelocityField | null = null;
      let steps = 0;
      const MAX_STEPS = 5000; // Safety limit to prevent infinite loops
      let hasReachedConvergence = false;
      const CONVERGENCE_THRESHOLD = 0.0001; // Stricter convergence threshold

      // Convert force vectors to target velocities with the user-defined weight
      // This allows us to reuse the force vector UI but apply them as target velocities
      const targetVelocities = convertForceVectorsToTargetVelocities(forceVectors, targetWeight);

      try {
        // Run iterations until convergence or max steps reached or aborted
        while (steps < MAX_STEPS && !hasReachedConvergence && !controller.signal.aborted) {
          // Use setTimeout to allow UI updates between steps
          await new Promise(resolve => setTimeout(resolve, 0));

          // Run a simulation step with empty forces array, using target velocities instead
          currentGrid = runSimulationStep(currentGrid, [], targetVelocities);
          steps++;

          // Update current step count in real-time
          setCurrentStep(steps);

          // Calculate and display delta for every iteration
          let maxDiff = 0;
          if (previousVelocityField) {
            // Calculate maximum difference between velocity fields
            for (let y = 0; y < currentGrid.u.length; y++) {
              for (let x = 0; x < currentGrid.u[y].length; x++) {
                const uDiff = Math.abs(currentGrid.u[y][x] - previousVelocityField.u[y][x]);
                maxDiff = Math.max(maxDiff, uDiff);
              }
            }

            for (let y = 0; y < currentGrid.v.length; y++) {
              for (let x = 0; x < currentGrid.v[y].length; x++) {
                const vDiff = Math.abs(currentGrid.v[y][x] - previousVelocityField.v[y][x]);
                maxDiff = Math.max(maxDiff, vDiff);
              }
            }

            // Update delta in real-time
            setCurrentDelta(maxDiff);

            // Check convergence with stricter threshold
            hasReachedConvergence = maxDiff < CONVERGENCE_THRESHOLD;
            if (hasReachedConvergence) {
              break;
            }
          }

          // Store current state for next comparison
          previousVelocityField = {
            u: currentGrid.u.map(row => [...row]), // Deep copy
            v: currentGrid.v.map(row => [...row]),
          };

          // Update the UI with current progress on every step
          if (!controller.signal.aborted) {
            setVelocityField({
              u: currentGrid.u,
              v: currentGrid.v,
            });
          }
        }

        // If the simulation wasn't aborted, update the final results
        if (!controller.signal.aborted) {
          // Update velocity field with the final results
          setVelocityField({
            u: currentGrid.u,
            v: currentGrid.v,
          });

          // Update convergence steps
          setConvergenceSteps(hasReachedConvergence ? steps : null);
        }
      } catch (error) {
        // Handle AbortError or other errors
        console.error('Simulation error or aborted:', error);
      } finally {
        // Only set isSimulating to false if this is still the current controller
        if (abortControllerRef.current === controller) {
          setIsSimulating(false);
        }
      }
    };

    runSimulation();

    // Clean up function - abort any ongoing simulation when dependencies change
    return () => {
      controller.abort();
    };
  }, [obstacleMask, forceVectors, targetWeight]); // Removed abortController from dependencies

  return [
    { velocityField, isSimulating, convergenceSteps, currentStep, currentDelta },
    {
      abortSimulation: () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      },
    },
  ];
}
