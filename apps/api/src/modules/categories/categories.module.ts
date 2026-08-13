import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { SlaPolicy } from './sla-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, SlaPolicy])],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
