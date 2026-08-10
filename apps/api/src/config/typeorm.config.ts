import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { Organization } from '../database/entities/organization.entity';

dotenv.config();

const url = process.env.DATABASE_URL;

export const typeOrmConfig: DataSourceOptions = url
  ? {
      type: 'postgres',
      url,
      entities: [User, Role, Organization],
      synchronize: false,
      migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
      migrationsTableName: 'migrations_api',
      extra: {
        max: 10,
      },
    }
  : {
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'crm',
      entities: [User, Role, Organization],
      synchronize: false,
      migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
      migrationsTableName: 'migrations_api',
      extra: {
        max: 10,
      },
    };

export const AppDataSource = new DataSource(typeOrmConfig);
