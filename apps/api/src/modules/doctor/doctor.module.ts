import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { DoctorRepository } from './repositories/doctor.repository';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile])],
  controllers: [DoctorController],
  providers: [DoctorRepository, DoctorService],
  exports: [DoctorRepository, DoctorService],
})
export class DoctorModule {}
