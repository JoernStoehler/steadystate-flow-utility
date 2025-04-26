/**
 * Server-only environment variable utilities.
 * This file should only be imported in server-side code.
 */

/**
 * Gets an environment variable by name, with optional validation.
 *
 * @param key - The name of the environment variable
 * @param defaultValue - Optional default value if the environment variable is not set
 * @param required - Whether the environment variable is required (defaults to false)
 * @returns The environment variable value or the default value
 * @throws If the environment variable is required but not set
 */
export function getEnv(key: string, defaultValue?: string, required = false): string {
  const value = process.env[key] || defaultValue;

  if (required && value === undefined) {
    throw new Error(`Required environment variable "${key}" is not set`);
  }

  return value as string;
}

/**
 * Gets a numeric environment variable by name, with optional validation.
 *
 * @param key - The name of the environment variable
 * @param defaultValue - Optional default numeric value if the environment variable is not set
 * @param required - Whether the environment variable is required (defaults to false)
 * @returns The environment variable value as a number or the default value
 * @throws If the environment variable is required but not set or if it's not a valid number
 */
export function getNumericEnv(key: string, defaultValue?: number, required = false): number {
  const stringValue = process.env[key];

  if (stringValue === undefined) {
    if (required && defaultValue === undefined) {
      throw new Error(`Required environment variable "${key}" is not set`);
    }
    return defaultValue as number;
  }

  const value = Number(stringValue);
  if (isNaN(value)) {
    throw new Error(`Environment variable "${key}" must be a valid number`);
  }

  return value;
}

/**
 * Gets a boolean environment variable by name, with optional validation.
 * Values "true", "1", "yes" are interpreted as true; others as false.
 *
 * @param key - The name of the environment variable
 * @param defaultValue - Optional default boolean value if the environment variable is not set
 * @param required - Whether the environment variable is required (defaults to false)
 * @returns The environment variable value as a boolean or the default value
 * @throws If the environment variable is required but not set
 */
export function getBooleanEnv(key: string, defaultValue?: boolean, required = false): boolean {
  const stringValue = process.env[key];

  if (stringValue === undefined) {
    if (required && defaultValue === undefined) {
      throw new Error(`Required environment variable "${key}" is not set`);
    }
    return defaultValue as boolean;
  }

  const normalizedValue = stringValue.toLowerCase().trim();
  return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes';
}
