import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalNote } from './entities/medical-note.entity';
import { MedicalNoteService } from './medical-note.service';
import { MedicalNoteController } from './medical-note.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalNote])],
  controllers: [MedicalNoteController],
  providers: [MedicalNoteService],
  exports: [MedicalNoteService],
})
export class MedicalNoteModule {}
