import { z } from 'zod';

/** Shared NODE_ENV enum for Nest env schemas (internal helper). */
export const nodeEnv = z
  .enum(['development', 'test', 'production'])
  .default('development');
