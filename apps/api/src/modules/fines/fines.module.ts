import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fine } from './fine.entity';
import { FinesController } from './fines.controller';
import { FinesService } from './fines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fine])],
  controllers: [FinesController],
  providers: [FinesService],
  exports: [FinesService, TypeOrmModule],
})
export class FinesModule {}
