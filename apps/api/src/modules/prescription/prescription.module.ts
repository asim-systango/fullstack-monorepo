import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionRepository } from './repositories/prescription.repository';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription])],
  controllers: [PrescriptionController],
  providers: [PrescriptionRepository, PrescriptionService],
  exports: [PrescriptionRepository, PrescriptionService],
})
export class PrescriptionModule {}
