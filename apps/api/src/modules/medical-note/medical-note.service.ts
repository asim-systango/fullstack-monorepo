import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MedicalNoteRepository } from './repositories/medical-note.repository';
import { MedicalNote } from './entities/medical-note.entity';
import { CreateMedicalNoteDto } from './dto/create-medical-note.dto';
import { UpdateMedicalNoteDto } from './dto/update-medical-note.dto';

@Injectable()
export class MedicalNoteService {
  private readonly logger = new Logger(MedicalNoteService.name);

  constructor(private readonly medicalNoteRepository: MedicalNoteRepository) {}

  async findAll(query?: {
    appointmentId?: string;
    doctorId?: string;
  }): Promise<MedicalNote[]> {
    return this.medicalNoteRepository.findAll(query);
  }

  async findOne(id: string): Promise<MedicalNote> {
    const note = await this.medicalNoteRepository.findById(id);
    if (!note) {
      throw new NotFoundException(`Medical note with ID "${id}" not found`);
    }
    return note;
  }

  async create(dto: CreateMedicalNoteDto): Promise<MedicalNote> {
    this.logger.log(`Creating medical note for appointment ${dto.appointmentId}`);
    return this.medicalNoteRepository.create({
      appointmentId: dto.appointmentId,
      doctorId: dto.doctorId,
      notes: dto.notes,
    });
  }

  async update(id: string, dto: UpdateMedicalNoteDto): Promise<MedicalNote> {
    await this.findOne(id);
    const updated = await this.medicalNoteRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Medical note with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.medicalNoteRepository.delete(id);
    return { success: true, message: `Medical note "${id}" deleted successfully` };
  }
}
