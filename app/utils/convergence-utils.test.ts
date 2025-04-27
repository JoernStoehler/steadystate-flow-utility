import { describe, it, expect } from 'vitest';

import { hasConverged } from './convergence-utils';

describe('convergence-utils', () => {
  describe('hasConverged', () => {
    it('should return true when velocity fields are similar', () => {
      const field1 = {
        u: [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        v: [
          [0.5, 0.6],
          [0.7, 0.8],
        ],
      };
      const field2 = {
        u: [
          [0.1001, 0.2001],
          [0.3001, 0.4001],
        ],
        v: [
          [0.5001, 0.6001],
          [0.7001, 0.8001],
        ],
      };

      expect(hasConverged(field1, field2, 0.001)).toBe(true);
    });

    it('should return false when velocity fields differ significantly', () => {
      const field1 = {
        u: [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        v: [
          [0.5, 0.6],
          [0.7, 0.8],
        ],
      };
      const field2 = {
        u: [
          [0.15, 0.25],
          [0.35, 0.45],
        ],
        v: [
          [0.55, 0.65],
          [0.75, 0.85],
        ],
      };

      expect(hasConverged(field1, field2, 0.001)).toBe(false);
    });

    it('should return false when fields are null', () => {
      expect(hasConverged(null, { u: [], v: [] })).toBe(false);
      expect(hasConverged({ u: [], v: [] }, null)).toBe(false);
      expect(hasConverged(null, null)).toBe(false);
    });
  });
});
