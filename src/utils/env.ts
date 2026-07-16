/**
 * Environment variable validation utility
 * Validates required environment variables at startup
 */

type EnvVar = {
  name: string;
  required: boolean;
  description?: string;
};

const requiredEnvVars: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: false,
    description: 'Supabase service role key (required for admin operations)',
  },
];

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates environment variables
 * @returns Validation result with missing and optional variables
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];

    if (envVar.required && !value) {
      missing.push(envVar.name);
    } else if (!envVar.required && !value) {
      warnings.push(envVar.name);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Gets a required environment variable or throws an error
 * @param name - Environment variable name
 * @param throwError - Whether to throw an error if missing (default: true)
 * @returns Environment variable value
 * @throws Error if variable is missing and throwError is true
 */
export function getRequiredEnv(name: string, throwError: boolean = true): string {
  const value = process.env[name];
  if (!value) {
    if (throwError) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    // Return empty string as fallback if not throwing
    return '';
  }
  return value;
}

/**
 * Gets an optional environment variable
 * @param name - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Environment variable value or default
 */
export function getOptionalEnv(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue;
}

/**
 * Validates and logs environment variables on server startup
 * Should be called in server-side code only
 */
export function validateAndLogEnv(): void {
  if (typeof window !== 'undefined') {
    // Skip validation on client side
    return;
  }

  const result = validateEnv();

  if (!result.isValid) {
    console.error('❌ Missing required environment variables:');
    result.missing.forEach((name) => {
      const envVar = requiredEnvVars.find((e) => e.name === name);
      console.error(`  - ${name}${envVar?.description ? ` (${envVar.description})` : ''}`);
    });
    throw new Error('Missing required environment variables. Please check your .env file.');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    result.warnings.forEach((name) => {
      const envVar = requiredEnvVars.find((e) => e.name === name);
      console.warn(`  - ${name}${envVar?.description ? ` (${envVar.description})` : ''}`);
    });
  }

  if (result.isValid && result.warnings.length === 0 && process.env.NODE_ENV === 'development') {
    console.log('✅ All environment variables are set');
  }
}
