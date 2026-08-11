import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { JwtUser } from '../../common/auth';

describe('AppointmentService (Unit)', () => {
  let service: AppointmentService;
  let repoMock: any;
  let doctorServiceMock: any;
  let dataSourceMock: any;

  const mockPatientUser: JwtUser = {
    id: 'patient-111',
    email: 'patient@example.com',
    role: 'PATIENT',
  };

  const mockDoctorUser: JwtUser = {
    id: 'user-doc-1',
    email: 'doctor@example.com',
    role: 'DOCTOR',
  };

  const mockAdminUser: JwtUser = {
    id: 'admin-999',
    email: 'admin@example.com',
    role: 'ADMIN',
  };

  beforeEach(() => {
    repoMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlotId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    doctorServiceMock = {
      findByUserId: jest.fn(),
    };

    dataSourceMock = {
      createQueryRunner: jest.fn(),
    };

    service = new AppointmentService(repoMock, doctorServiceMock, dataSourceMock);
  });

  describe('findAll filtering & role scoping', () => {
    it('forces patientId filter for PATIENT role', async () => {
      repoMock.findAll.mockResolvedValue({
        items: [{ id: 'appt-1', patientId: 'patient-111', medicalNotes: ['note1'] }],
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      });

      const result = await service.findAll(mockPatientUser, { page: 1, limit: 10 });

      expect(repoMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: 'patient-111' }),
      );
      // Strips medical notes for patient
      expect(result.items[0].medicalNotes).toEqual([]);
    });

    it('forces doctorId filter for DOCTOR role', async () => {
      doctorServiceMock.findByUserId.mockResolvedValue({ id: 'doctor-doc-1' });
      repoMock.findAll.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
      });

      await service.findAll(mockDoctorUser, {});

      expect(doctorServiceMock.findByUserId).toHaveBeenCalledWith('user-doc-1');
      expect(repoMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ doctorId: 'doctor-doc-1' }),
      );
    });

    it('allows hospital-wide query for ADMIN role', async () => {
      repoMock.findAll.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
      });

      await service.findAll(mockAdminUser, { search: 'Cardiology' });

      expect(repoMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'Cardiology' }),
      );
    });

    it('rejects query when dateFrom > dateTo', async () => {
      await expect(
        service.findAll(mockPatientUser, {
          dateFrom: '2026-08-10',
          dateTo: '2026-08-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAdminAppointments', () => {
    it('throws ForbiddenException if non-admin tries to call admin endpoint', async () => {
      await expect(service.findAdminAppointments(mockPatientUser, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('complete state transitions', () => {
    let queryRunnerMock: any;

    beforeEach(() => {
      queryRunnerMock = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          findOne: jest.fn(),
          save: jest.fn(),
          create: jest.fn((entity: any, dto: any) => dto),
        },
      };
      dataSourceMock.createQueryRunner.mockReturnValue(queryRunnerMock);
    });

    it('rejects completing a CANCELLED appointment', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'appt-cancelled',
        status: AppointmentStatus.CANCELLED,
        slot: { doctorId: 'doctor-doc-1' },
      });

      await expect(service.complete('appt-cancelled', mockDoctorUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });

    it('rejects completing an ALREADY COMPLETED appointment', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'appt-completed',
        status: AppointmentStatus.COMPLETED,
        slot: { doctorId: 'doctor-doc-1' },
      });

      await expect(service.complete('appt-completed', mockDoctorUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects doctor completing an appointment belonging to another doctor', async () => {
      doctorServiceMock.findByUserId.mockResolvedValue({ id: 'doctor-doc-1' });
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'appt-other-doc',
        status: AppointmentStatus.SCHEDULED,
        slot: { doctorId: 'doctor-doc-2' },
      });

      await expect(service.complete('appt-other-doc', mockDoctorUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
