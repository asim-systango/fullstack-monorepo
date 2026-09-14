import '../load-env';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { resolve } from 'path';

/**
 * TypeORM CLI data source.
 * Env: first existing of apps/api/.env then root .env (see load-env; no merge).
 * Entity glob picks up `*.entity.ts` under modules — keep that naming convention.
 *
 * `migrationsTableName` is per-app on purpose: this app and the gateway share one
 * DATABASE_URL, so a single ledger would let `migration:revert` there pick up a
 * domain migration it cannot resolve ("No migration X was found in the source code").
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
  migrationsTableName: 'migrations_api',
  synchronize: false,
});

export default dataSource;
