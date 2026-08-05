import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MedicalNoteService } from './medical-note.service';

/**
 * Medical note controller — REST endpoint shell.
 * Endpoints will be added on Day 2.
 */
@ApiTags('Medical Notes')
@Controller('medical-notes')
export class MedicalNoteController {
  constructor(private readonly medicalNoteService: MedicalNoteService) {}
}
