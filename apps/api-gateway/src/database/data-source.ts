import '../load-env';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { resolve } from 'path';

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
