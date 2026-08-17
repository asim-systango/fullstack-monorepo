import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '../loans/loan.entity';
import { SettingsModule } from '../settings/settings.module';
import { Fine } from './fine.entity';
import { FinesController, MyFinesController } from './fines.controller';
import { FinesService } from './fines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fine, Loan]), SettingsModule],
  controllers: [FinesController, MyFinesController],
  providers: [FinesService],
  exports: [FinesService, TypeOrmModule],
})
export class FinesModule {}
