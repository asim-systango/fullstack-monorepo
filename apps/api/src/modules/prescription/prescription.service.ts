import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrescriptionRepository } from './repositories/prescription.repository';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);

  constructor(private readonly prescriptionRepository: PrescriptionRepository) {}

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepository.findAll();
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID "${id}" not found`);
    }
    return prescription;
  }

  async findByAppointmentId(appointmentId: string): Promise<Prescription | null> {
    return this.prescriptionRepository.findByAppointmentId(appointmentId);
  }

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    this.logger.log(`Creating prescription for appointment ${dto.appointmentId}`);
    return this.prescriptionRepository.create({
      appointmentId: dto.appointmentId,
      medicines: dto.medicines,
      instructions: dto.instructions ?? null,
    });
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    await this.findOne(id);
    const updated = await this.prescriptionRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Prescription with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.prescriptionRepository.delete(id);
    return { success: true, message: `Prescription "${id}" deleted successfully` };
  }
}
