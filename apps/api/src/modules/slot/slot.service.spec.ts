import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotStatus } from '../../shared/enums/slot-status.enum';

describe('SlotService (Unit)', () => {
  let service: SlotService;
  let slotRepoMock: any;

  const mockSlot = {
    id: 'slot-111',
    doctorId: 'doctor-222',
    startsAt: new Date(Date.now() + 3600000), // +1hr
    endsAt: new Date(Date.now() + 5400000), // +1.5hr
    status: SlotStatus.AVAILABLE,
  };

  beforeEach(() => {
    slotRepoMock = {
      findAll: jest.fn(),
      findAvailableByDoctorId: jest.fn(),
      findById: jest.fn(),
      findOverlappingSlot: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new SlotService(slotRepoMock);
  });

  describe('findAll & findAvailableForDoctor', () => {
    it('returns list of slots for doctor', async () => {
      slotRepoMock.findAll.mockResolvedValue([mockSlot]);
      const result = await service.findAll({ doctorId: 'doctor-222' });
      expect(result).toEqual([mockSlot]);
    });

    it('returns available slots for doctor', async () => {
      slotRepoMock.findAvailableByDoctorId.mockResolvedValue([mockSlot]);
      const result = await service.findAvailableForDoctor('doctor-222');
      expect(result).toEqual([mockSlot]);
    });
  });

  describe('findOne', () => {
    it('returns slot when found', async () => {
      slotRepoMock.findById.mockResolvedValue(mockSlot);
      const result = await service.findOne('slot-111');
      expect(result).toEqual(mockSlot);
    });

    it('throws NotFoundException when slot does not exist', async () => {
      slotRepoMock.findById.mockResolvedValue(null);
      await expect(service.findOne('invalid-slot')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createBulk', () => {
    it('creates bulk slots when valid payload provided', async () => {
      slotRepoMock.findOverlappingSlot.mockResolvedValue(null);
      slotRepoMock.create.mockResolvedValue(mockSlot);

      const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const result = await service.createBulk({
        doctorId: 'doctor-222',
        date: futureDate!,
        shifts: [{ startTime: '09:00', endTime: '12:00' }],
        slotDurationMinutes: 30,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('throws BadRequestException if startDate > endDate', async () => {
      await expect(
        service.createBulk({
          doctorId: 'doctor-222',
          date: '2026-08-20',
          endDate: '2026-08-10',
          shifts: [{ startTime: '09:00', endTime: '12:00' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deletes slot successfully when not booked', async () => {
      slotRepoMock.findById.mockResolvedValue(mockSlot);
      slotRepoMock.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('slot-111');
      expect(result.success).toBe(true);
      expect(slotRepoMock.delete).toHaveBeenCalledWith('slot-111');
    });

    it('throws BadRequestException when deleting a booked slot', async () => {
      slotRepoMock.findById.mockResolvedValue({ ...mockSlot, status: SlotStatus.BOOKED });
      await expect(service.remove('slot-111')).rejects.toThrow(BadRequestException);
    });
  });
});
