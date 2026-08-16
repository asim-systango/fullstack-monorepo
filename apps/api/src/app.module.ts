import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { UsersModule } from './modules/users/users.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { MovementsModule } from './modules/movements/movements.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

const db = databaseConfig();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...db,
    }),
    AuthModule,
    HealthModule,
    UsersModule,
    WarehousesModule,
    CategoriesModule,
    ProductsModule,
    MovementsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
