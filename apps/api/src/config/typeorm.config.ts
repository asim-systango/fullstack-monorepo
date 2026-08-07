import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../database/entities/user.entity';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'app',
  entities: [User],
  synchronize: false,
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations_api',
  extra: {
    max: 10,
  },
};

export const AppDataSource = new DataSource(typeOrmConfig);
