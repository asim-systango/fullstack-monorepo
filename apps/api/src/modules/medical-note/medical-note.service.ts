import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalNote } from './entities/medical-note.entity';

/**
 * MedicalNote service — business logic shell.
 * CRUD will be added on Day 2.
 */
@Injectable()
export class MedicalNoteService {
  private readonly logger = new Logger(MedicalNoteService.name);

  constructor(
    @InjectRepository(MedicalNote)
    private readonly medicalNoteRepository: Repository<MedicalNote>,
  ) {
    this.logger.log('MedicalNoteService initialized');
  }
}
