import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { SlotStatus } from '../../shared/enums/slot-status.enum';
import { JwtUser } from '../../common/auth';

describe('AppointmentService (Unit & Integration Hardening)', () => {
  let service: AppointmentService;
  let repoMock: any;
  let doctorServiceMock: any;
  let dataSourceMock: any;

  const mockPatientUser: JwtUser = {
    id: 'patient-111',
    email: 'patient@example.com',
    role: 'PATIENT',
  };

  const mockOtherPatientUser: JwtUser = {
    id: 'patient-999',
    email: 'otherpatient@example.com',
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
    it('forces patientId filter for PATIENT role and strips medical notes', async () => {
      repoMock.findAll.mockResolvedValue({
        items: [
          { id: 'appt-1', patientId: 'patient-111', medicalNotes: [{ notes: 'secret' }] },
        ],
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      });

      const result = await service.findAll(mockPatientUser, { page: 1, limit: 10 });

      expect(repoMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: 'patient-111' }),
      );
      expect(result.items?.[0]?.medicalNotes).toEqual([]);
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

    it('rejects query when dateFrom > dateTo with 400 Bad Request', async () => {
      await expect(
        service.findAll(mockPatientUser, {
          dateFrom: '2026-08-10',
          dateTo: '2026-08-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne ownership validation', () => {
    it('allows patient to view their own appointment', async () => {
      repoMock.findById.mockResolvedValue({
        id: 'appt-1',
        patientId: 'patient-111',
        medicalNotes: [{ notes: 'internal' }],
      });

      const res = await service.findOne('appt-1', mockPatientUser);
      expect(res.id).toBe('appt-1');
      expect(res.medicalNotes).toEqual([]);
    });

    it('rejects patient attempting to view another patient appointment (403 Forbidden)', async () => {
      repoMock.findById.mockResolvedValue({
        id: 'appt-1',
        patientId: 'patient-111',
      });

      await expect(service.findOne('appt-1', mockOtherPatientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create (Transactional Booking & Pessimistic Locking)', () => {
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

    it('successfully books an available slot with pessimistic lock', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'slot-100',
        status: SlotStatus.AVAILABLE,
        startsAt: futureDate,
      });

      const mockCreatedAppt = {
        id: 'appt-new',
        patientId: 'patient-111',
        slotId: 'slot-100',
        status: AppointmentStatus.SCHEDULED,
      };

      queryRunnerMock.manager.create.mockReturnValue(mockCreatedAppt);
      queryRunnerMock.manager.save.mockResolvedValue(mockCreatedAppt);
      repoMock.findById.mockResolvedValue(mockCreatedAppt);

      const result = await service.create('patient-111', {
        slotId: 'slot-100',
        reason: 'Regular Checkup',
      });

      expect(queryRunnerMock.manager.findOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(result.id).toBe('appt-new');
    });

    it('rejects booking when slot is already BOOKED (409 Conflict)', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'slot-100',
        status: SlotStatus.BOOKED,
      });

      await expect(service.create('patient-111', { slotId: 'slot-100' })).rejects.toThrow(
        ConflictException,
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });

    it('rejects booking when slot is BLOCKED (409 Conflict)', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'slot-100',
        status: SlotStatus.BLOCKED,
      });

      await expect(service.create('patient-111', { slotId: 'slot-100' })).rejects.toThrow(
        ConflictException,
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });

    it('rejects booking past slot (400 Bad Request)', async () => {
      const pastDate = new Date(Date.now() - 3600000);
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'slot-100',
        status: SlotStatus.AVAILABLE,
        startsAt: pastDate,
      });

      await expect(service.create('patient-111', { slotId: 'slot-100' })).rejects.toThrow(
        BadRequestException,
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });

    it('rolls back transaction when database save fails during booking', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'slot-100',
        status: SlotStatus.AVAILABLE,
        startsAt: futureDate,
      });
      queryRunnerMock.manager.save.mockRejectedValue(new Error('DB Save Failure'));

      await expect(service.create('patient-111', { slotId: 'slot-100' })).rejects.toThrow(
        'DB Save Failure',
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });

  describe('remove (Transactional Cancellation & Slot Recovery)', () => {
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
        },
      };
      dataSourceMock.createQueryRunner.mockReturnValue(queryRunnerMock);
    });

    it('patient cancels own appointment: marks CANCELLED and frees slot to AVAILABLE', async () => {
      const mockAppt = {
        id: 'appt-1',
        patientId: 'patient-111',
        slotId: 'slot-100',
        status: AppointmentStatus.SCHEDULED,
      };

      const mockSlot = {
        id: 'slot-100',
        status: SlotStatus.BOOKED,
      };

      queryRunnerMock.manager.findOne
        .mockResolvedValueOnce(mockAppt)
        .mockResolvedValueOnce(mockSlot);

      const result = await service.remove('appt-1', 'patient-111', 'PATIENT');

      expect(result.success).toBe(true);
      expect(mockAppt.status).toBe(AppointmentStatus.CANCELLED);
      expect(mockSlot.status).toBe(SlotStatus.AVAILABLE);
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });

    it('rejects cancellation when non-owner patient attempts to cancel another patient appointment (403 Forbidden)', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'appt-1',
        patientId: 'patient-111',
        status: AppointmentStatus.SCHEDULED,
      });

      await expect(service.remove('appt-1', 'patient-999', 'PATIENT')).rejects.toThrow(
        ForbiddenException,
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });

    it('rejects cancelling an ALREADY CANCELLED appointment (400 Bad Request)', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'appt-cancelled',
        patientId: 'patient-111',
        status: AppointmentStatus.CANCELLED,
      });

      await expect(
        service.remove('appt-cancelled', 'patient-111', 'PATIENT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects cancelling a COMPLETED appointment (400 Bad Request)', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({
        id: 'appt-completed',
        patientId: 'patient-111',
        status: AppointmentStatus.COMPLETED,
      });

      await expect(
        service.remove('appt-completed', 'patient-111', 'PATIENT'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete state transitions & authorization', () => {
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
