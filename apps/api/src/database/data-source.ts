import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import { User } from '../modules/users/user.entity';

loadDotenv({ path: resolve(__dirname, '../../.env') });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required for TypeORM CLI');
}

const dataSource = new DataSource({
  type: 'postgres',
  url,
  entities: [User],
  migrations: [resolve(__dirname, './migrations/*.{ts,js}')],
  synchronize: false,
});

export default dataSource;
