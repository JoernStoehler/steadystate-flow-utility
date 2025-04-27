import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as simulationModule from '../utils/simulation';

import { useSimulation } from './use-simulation';

describe('useSimulation', () => {
  beforeEach(() => {
    // Mock the simulation utilities
    vi.spyOn(simulationModule, 'createGridFromMask').mockImplementation(() => ({
      u: [[0]],
      v: [[0]],
      p: [[0]],
      pressure: [[0]],
      mask: [[false]],
      isObstacle: [[false]],
      width: 1,
      height: 1,
    }));

    vi.spyOn(simulationModule, 'runSimulationStep').mockImplementation(grid => {
      return {
        ...grid,
        u: [[0.1]],
        v: [[0.1]],
      };
    });

    vi.spyOn(simulationModule, 'convertForceVectorsToTargetVelocities').mockImplementation(
      () => []
    );

    // Mock AbortController
    global.AbortController = vi.fn().mockImplementation(() => ({
      signal: { aborted: false },
      abort: vi.fn(),
    }));
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useSimulation({
        obstacleMask: null,
        forceVectors: [],
        targetWeight: 0.1,
      })
    );

    const [state, controllers] = result.current;

    expect(state.velocityField).toBeNull();
    expect(state.isSimulating).toBe(false);
    expect(state.convergenceSteps).toBeNull();
    expect(state.currentStep).toBe(0);
    expect(state.currentDelta).toBeNull();
    expect(typeof controllers.abortSimulation).toBe('function');
  });

  it('should not start simulation without obstacle mask', () => {
    const { result } = renderHook(() =>
      useSimulation({
        obstacleMask: null,
        forceVectors: [{ x: 0.5, y: 0.5, fx: 1, fy: 0 }],
        targetWeight: 0.1,
      })
    );

    const [state] = result.current;
    expect(state.isSimulating).toBe(false);
  });
});
