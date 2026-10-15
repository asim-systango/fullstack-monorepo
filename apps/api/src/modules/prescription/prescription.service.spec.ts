import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { JwtUser } from '../../common/auth';

describe('PrescriptionService (Unit)', () => {
  let service: PrescriptionService;
  let prescriptionRepoMock: any;
  let appointmentRepoMock: any;
  let doctorServiceMock: any;

  const mockDoctorUser: JwtUser = {
    id: 'user-doc-1',
    email: 'doctor@example.com',
    role: 'DOCTOR',
  };

  const mockPatientUser: JwtUser = {
    id: 'patient-1',
    email: 'patient@example.com',
    role: 'PATIENT',
  };

  beforeEach(() => {
    prescriptionRepoMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByAppointmentId: jest.fn(),
      create: jest.fn(async (v) => ({ id: 'rx-1', ...v })),
      update: jest.fn(),
      delete: jest.fn(),
    };

    appointmentRepoMock = {
      findById: jest.fn(),
    };

    doctorServiceMock = {
      findByUserId: jest.fn(),
    };

    service = new PrescriptionService(
      prescriptionRepoMock,
      appointmentRepoMock,
      doctorServiceMock,
    );
  });

  describe('createForAppointment', () => {
    it('allows prescription for COMPLETED appointment by assigned doctor', async () => {
      appointmentRepoMock.findById.mockResolvedValue({
        id: 'appt-1',
        status: AppointmentStatus.COMPLETED,
        slot: { doctorId: 'doc-1' },
      });
      doctorServiceMock.findByUserId.mockResolvedValue({ id: 'doc-1' });
      prescriptionRepoMock.findByAppointmentId.mockResolvedValue(null);

      const dto = {
        medicines: [{ name: 'Amoxicillin', dosage: '500mg', frequency: '3x daily' }],
        instructions: 'After meal',
      };

      const result = await service.createForAppointment('appt-1', dto, mockDoctorUser);

      expect(result.id).toBe('rx-1');
      expect(prescriptionRepoMock.create).toHaveBeenCalled();
    });

    it('rejects prescription for SCHEDULED appointment', async () => {
      appointmentRepoMock.findById.mockResolvedValue({
        id: 'appt-scheduled',
        status: AppointmentStatus.SCHEDULED,
        slot: { doctorId: 'doc-1' },
      });

      const dto = {
        medicines: [{ name: 'Aspirin', dosage: '100mg', frequency: 'Daily' }],
      };

      await expect(
        service.createForAppointment('appt-scheduled', dto, mockDoctorUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects prescription for another doctor appointment', async () => {
      appointmentRepoMock.findById.mockResolvedValue({
        id: 'appt-other-doc',
        status: AppointmentStatus.COMPLETED,
        slot: { doctorId: 'doc-2' },
      });
      doctorServiceMock.findByUserId.mockResolvedValue({ id: 'doc-1' });

      const dto = {
        medicines: [{ name: 'Aspirin', dosage: '100mg', frequency: 'Daily' }],
      };

      await expect(
        service.createForAppointment('appt-other-doc', dto, mockDoctorUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws 409 Conflict if duplicate prescription exists', async () => {
      appointmentRepoMock.findById.mockResolvedValue({
        id: 'appt-1',
        status: AppointmentStatus.COMPLETED,
        slot: { doctorId: 'doc-1' },
      });
      doctorServiceMock.findByUserId.mockResolvedValue({ id: 'doc-1' });
      prescriptionRepoMock.findByAppointmentId.mockResolvedValue({ id: 'rx-existing' });

      const dto = {
        medicines: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'PRN' }],
      };

      await expect(
        service.createForAppointment('appt-1', dto, mockDoctorUser),
      ).rejects.toThrow(ConflictException);
    });
  });
});
