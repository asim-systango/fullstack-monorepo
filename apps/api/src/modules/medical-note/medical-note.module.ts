import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalNote } from './entities/medical-note.entity';
import { MedicalNoteRepository } from './repositories/medical-note.repository';
import { MedicalNoteService } from './medical-note.service';
import { MedicalNoteController } from './medical-note.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalNote])],
  controllers: [MedicalNoteController],
  providers: [MedicalNoteRepository, MedicalNoteService],
  exports: [MedicalNoteRepository, MedicalNoteService],
})
export class MedicalNoteModule {}
