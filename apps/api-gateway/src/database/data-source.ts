import '../load-env';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { resolve } from 'path';

/**
 * TypeORM CLI data source.
 * Env: first existing of apps/api-gateway/.env then root .env (see load-env; no merge).
 * Entity glob picks up `*.entity.ts` under modules — keep that naming convention.
 *
 * Keeps the default `migrations` ledger. apps/api uses `migrations_api` instead:
 * both apps share one DATABASE_URL, and a single ledger would let `migration:revert`
 * here pick up a domain migration it cannot resolve ("No migration X was found in
 * the source code"). The gateway keeps the default name so existing databases —
 * which already recorded InitUsers there — are untouched.
 */
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required for TypeORM CLI');
}

const dataSource = new DataSource({
  type: 'postgres',
  url,
  entities: [resolve(__dirname, '../**/*.entity.{ts,js}')],
  migrations: [resolve(__dirname, './migrations/*.{ts,js}')],
  synchronize: false,
});

export default dataSource;
