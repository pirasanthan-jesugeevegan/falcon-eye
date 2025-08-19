import type { Environment } from '../constants/api';
import { ENVIRONMENTS } from '../constants/api';

// Environment detection utilities
export const isDevelopment = (env: string): boolean =>
  env === ENVIRONMENTS.DEVELOPMENT;
export const isProduction = (env: string): boolean =>
  env === ENVIRONMENTS.PRODUCTION;
export const isTest = (env: string): boolean => env === ENVIRONMENTS.TEST;

// Environment validation
export const validateEnvironment = (env: string): Environment => {
  const validEnvs = Object.values(ENVIRONMENTS);
  if (validEnvs.includes(env as Environment)) {
    return env as Environment;
  }
  return ENVIRONMENTS.DEVELOPMENT; // fallback
};

// Get environment with fallback
export const getEnvironment = (envVar?: string): Environment => {
  return validateEnvironment(envVar || ENVIRONMENTS.DEVELOPMENT);
};
