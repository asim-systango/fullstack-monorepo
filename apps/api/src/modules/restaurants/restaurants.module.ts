import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './menu-item.entity';
import { Restaurant } from './restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuItem])],
  exports: [TypeOrmModule],
})
export class RestaurantsModule {}
