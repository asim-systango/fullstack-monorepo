import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const candidates = [
  resolve(process.cwd(), 'apps/api/.env'),
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
