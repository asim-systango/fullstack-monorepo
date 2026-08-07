import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { CartModule } from './modules/cart';
import { HealthModule } from './modules/health';
import { OrdersModule } from './modules/orders';
import { RestaurantsModule } from './modules/restaurants';

const db = databaseConfig();

/**
 * Internal domain API — Bearer JWT only (cookie auth lives on api-gateway).
 * Add your domain modules here (do not put product CRUD in Next).
 * Entities registered via TypeOrmModule.forFeature are auto-loaded.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...db,
    }),
    AuthModule,
    RestaurantsModule,
    CartModule,
    OrdersModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
