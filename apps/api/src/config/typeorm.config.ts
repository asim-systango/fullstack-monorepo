import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { Organization } from '../database/entities/organization.entity';
import { Permission } from '../database/entities/permission.entity';
import { RoutePermission } from '../database/entities/route-permission.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';
import { Contact } from '../database/entities/contact.entity';
import { Lead } from '../database/entities/lead.entity';
import { Deal } from '../database/entities/deal.entity';
import { Activity } from '../database/entities/activity.entity';

dotenv.config();

const url = process.env.DATABASE_URL;

const entitiesList = [
  User,
  Role,
  Organization,
  Permission,
  RoutePermission,
  FormSubmission,
  Contact,
  Lead,
  Deal,
  Activity,
];

export const typeOrmConfig: DataSourceOptions = url
  ? {
    type: 'postgres',
    url,
    entities: entitiesList,
    synchronize: false,
    migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
    migrationsTableName: 'migrations_api',
    ssl: url.includes('supabase') ? { rejectUnauthorized: false } : undefined,
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
    entities: entitiesList,
    synchronize: false,
    migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
    migrationsTableName: 'migrations_api',
    extra: {
      max: 10,
    },
  };

export const AppDataSource = new DataSource(typeOrmConfig);
