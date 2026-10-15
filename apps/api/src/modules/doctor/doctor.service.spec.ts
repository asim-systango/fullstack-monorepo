import { NotFoundException } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorProfile } from './entities/doctor-profile.entity';

describe('DoctorService (Unit)', () => {
  let service: DoctorService;
  let doctorRepoMock: any;
  let dataSourceMock: any;
  let queryRunnerMock: any;

  const mockDoctor: Partial<DoctorProfile> = {
    id: 'doctor-123',
    userId: 'user-456',
    firstName: 'John',
    lastName: 'Doe',
    specialization: 'Cardiology',
    qualification: 'MD',
    experienceYears: 10,
    consultationFee: 150,
    isActive: true,
  };

  beforeEach(() => {
    doctorRepoMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        createQueryBuilder: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 2 }),
        }),
      },
    };

    dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    };

    service = new DoctorService(doctorRepoMock, dataSourceMock);
  });

  describe('findAll', () => {
    it('returns list of doctor profiles', async () => {
      doctorRepoMock.findAll.mockResolvedValue([mockDoctor]);
      const result = await service.findAll();
      expect(result).toEqual([mockDoctor]);
      expect(doctorRepoMock.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns doctor profile when found', async () => {
      doctorRepoMock.findById.mockResolvedValue(mockDoctor);
      const result = await service.findOne('doctor-123');
      expect(result).toEqual(mockDoctor);
    });

    it('throws NotFoundException when doctor profile does not exist', async () => {
      doctorRepoMock.findById.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove (soft delete & slot deactivation)', () => {
    it('atomically soft-deletes doctor and blocks future available slots', async () => {
      doctorRepoMock.findById.mockResolvedValue(mockDoctor);

      const result = await service.remove('doctor-123');

      expect(result.success).toBe(true);
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.manager.softDelete).toHaveBeenCalledWith(
        DoctorProfile,
        'doctor-123',
      );
      expect(queryRunnerMock.manager.update).toHaveBeenCalledWith(
        DoctorProfile,
        { id: 'doctor-123' },
        { isActive: false },
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('rolls back transaction if soft deletion fails', async () => {
      doctorRepoMock.findById.mockResolvedValue(mockDoctor);
      queryRunnerMock.manager.softDelete.mockRejectedValue(
        new Error('Database transaction error'),
      );

      await expect(service.remove('doctor-123')).rejects.toThrow(
        'Database transaction error',
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });
});
