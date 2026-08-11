import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalNote } from './entities/medical-note.entity';
import { MedicalNoteRepository } from './repositories/medical-note.repository';
import { MedicalNoteService } from './medical-note.service';
import { MedicalNoteController } from './medical-note.controller';
import { AppointmentModule } from '../appointment';
import { DoctorModule } from '../doctor';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalNote]), AppointmentModule, DoctorModule],
  controllers: [MedicalNoteController],
  providers: [MedicalNoteRepository, MedicalNoteService],
  exports: [MedicalNoteRepository, MedicalNoteService],
})
export class MedicalNoteModule {}
