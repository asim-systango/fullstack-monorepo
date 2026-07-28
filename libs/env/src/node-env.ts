import { z } from 'zod';

/** Shared NODE_ENV enum for Nest app env schemas (not a package export). */
export const nodeEnv = z
  .enum(['development', 'test', 'production'])
  .default('development');
