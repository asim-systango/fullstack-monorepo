import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MedicalNoteService } from './medical-note.service';
import { JwtUser } from '../../common/auth';

describe('MedicalNoteService (Unit)', () => {
  let service: MedicalNoteService;
  let noteRepoMock: any;
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
    noteRepoMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(async (v) => ({ id: 'note-1', ...v })),
      update: jest.fn(),
      delete: jest.fn(),
    };

    appointmentRepoMock = {
      findById: jest.fn(),
    };

    doctorServiceMock = {
      findByUserId: jest.fn(),
    };

    service = new MedicalNoteService(
      noteRepoMock,
      appointmentRepoMock,
      doctorServiceMock,
    );
  });

  describe('createForAppointment', () => {
    it('creates medical note for assigned doctor', async () => {
      appointmentRepoMock.findById.mockResolvedValue({
        id: 'appt-1',
        patientId: 'patient-1',
        slot: { doctorId: 'doc-1' },
      });
      doctorServiceMock.findByUserId.mockResolvedValue({ id: 'doc-1' });

      const result = await service.createForAppointment(
        'appt-1',
        { notes: 'Patient condition improving' } as any,
        mockDoctorUser,
      );

      expect(result.id).toBe('note-1');
      expect(noteRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: 'appt-1',
          doctorId: 'doc-1',
          notes: 'Patient condition improving',
        }),
      );
    });

    it('rejects note creation for another doctor appointment', async () => {
      appointmentRepoMock.findById.mockResolvedValue({
        id: 'appt-2',
        slot: { doctorId: 'doc-2' },
      });
      doctorServiceMock.findByUserId.mockResolvedValue({ id: 'doc-1' });

      await expect(
        service.createForAppointment(
          'appt-2',
          { notes: 'Test note' } as any,
          mockDoctorUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('privacy restrictions', () => {
    it('prevents PATIENT from accessing internal medical notes by appointment', async () => {
      await expect(
        service.findByAppointmentId('appt-1', mockPatientUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('prevents PATIENT from accessing internal medical note by id', async () => {
      await expect(service.findOne('note-1', mockPatientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
