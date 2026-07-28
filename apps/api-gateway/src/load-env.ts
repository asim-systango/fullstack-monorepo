import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Load env from the first existing candidate (no merge).
 * Prefer `apps/api-gateway/.env` for the gateway process; root `.env` is mainly for Compose.
 */
const candidates = [
  resolve(process.cwd(), 'apps/api-gateway/.env'),
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../../.env'),
];

for (const path of candidates) {
  if (existsSync(path)) {
    loadDotenv({ path });
    break;
  }
}
