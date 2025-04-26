import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getEnv, getNumericEnv, getBooleanEnv } from './env';

describe('Environment Variable Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getEnv', () => {
    it('should return environment variable when it exists', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
    });

    it('should return default value when environment variable does not exist', () => {
      expect(getEnv('NON_EXISTENT_VAR', 'default-value')).toBe('default-value');
    });

    it('should throw an error when required variable does not exist', () => {
      expect(() => getEnv('REQUIRED_VAR', undefined, true)).toThrow(
        'Required environment variable "REQUIRED_VAR" is not set'
      );
    });
  });

  describe('getNumericEnv', () => {
    it('should return numeric environment variable when it exists', () => {
      process.env.NUMERIC_VAR = '42';
      expect(getNumericEnv('NUMERIC_VAR')).toBe(42);
    });

    it('should return default value when environment variable does not exist', () => {
      expect(getNumericEnv('NON_EXISTENT_NUMERIC_VAR', 100)).toBe(100);
    });

    it('should throw an error when required variable does not exist', () => {
      expect(() => getNumericEnv('REQUIRED_NUMERIC_VAR', undefined, true)).toThrow(
        'Required environment variable "REQUIRED_NUMERIC_VAR" is not set'
      );
    });

    it('should throw an error when variable is not a valid number', () => {
      process.env.INVALID_NUMERIC_VAR = 'not-a-number';
      expect(() => getNumericEnv('INVALID_NUMERIC_VAR')).toThrow(
        'Environment variable "INVALID_NUMERIC_VAR" must be a valid number'
      );
    });
  });

  describe('getBooleanEnv', () => {
    it('should return true for "true", "1", and "yes" values', () => {
      process.env.BOOL_VAR_TRUE = 'true';
      process.env.BOOL_VAR_ONE = '1';
      process.env.BOOL_VAR_YES = 'yes';

      expect(getBooleanEnv('BOOL_VAR_TRUE')).toBe(true);
      expect(getBooleanEnv('BOOL_VAR_ONE')).toBe(true);
      expect(getBooleanEnv('BOOL_VAR_YES')).toBe(true);
    });

    it('should return false for other string values', () => {
      process.env.BOOL_VAR_FALSE = 'false';
      process.env.BOOL_VAR_OTHER = 'something';

      expect(getBooleanEnv('BOOL_VAR_FALSE')).toBe(false);
      expect(getBooleanEnv('BOOL_VAR_OTHER')).toBe(false);
    });

    it('should handle case-insensitive values', () => {
      process.env.BOOL_VAR_UPPERCASE = 'TRUE';
      process.env.BOOL_VAR_MIXED = 'Yes';

      expect(getBooleanEnv('BOOL_VAR_UPPERCASE')).toBe(true);
      expect(getBooleanEnv('BOOL_VAR_MIXED')).toBe(true);
    });

    it('should return default value when environment variable does not exist', () => {
      expect(getBooleanEnv('NON_EXISTENT_BOOL_VAR', true)).toBe(true);
      expect(getBooleanEnv('NON_EXISTENT_BOOL_VAR', false)).toBe(false);
    });

    it('should throw an error when required variable does not exist', () => {
      expect(() => getBooleanEnv('REQUIRED_BOOL_VAR', undefined, true)).toThrow(
        'Required environment variable "REQUIRED_BOOL_VAR" is not set'
      );
    });
  });
});
