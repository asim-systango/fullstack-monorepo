import {
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { InsuranceClaimStatus } from './entities/insurance-claim.entity';

describe('InsuranceService (Unit)', () => {
  let service: InsuranceService;
  let claimRepoMock: any;

  const mockUser = {
    id: 'user-pat-123',
    role: 'PATIENT',
  };

  const mockAdmin = {
    id: 'user-admin-999',
    role: 'ADMIN',
  };

  const mockClaim = {
    id: 'claim-001',
    appointmentId: 'appt-100',
    patientId: 'user-pat-123',
    providerName: 'Star Health',
    policyNumber: 'POL-123',
    claimAmount: 1000,
    coveredAmount: 800,
    copayAmount: 200,
    status: InsuranceClaimStatus.SUBMITTED,
    createdAt: new Date(),
  };

  beforeEach(() => {
    claimRepoMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    service = new InsuranceService(claimRepoMock);
  });

  describe('createClaim', () => {
    it('creates an insurance claim with 80% default coverage', async () => {
      claimRepoMock.findOne.mockResolvedValue(null);
      claimRepoMock.create.mockImplementation((data: any) => data);
      claimRepoMock.save.mockImplementation((data: any) =>
        Promise.resolve({ id: 'claim-001', ...data }),
      );

      const result = await service.createClaim(mockUser as any, {
        appointmentId: 'appt-100',
        providerName: 'Star Health',
        policyNumber: 'POL-123',
        claimAmount: 1000,
      });

      expect(result.coveredAmount).toBe(800);
      expect(result.copayAmount).toBe(200);
      expect(result.status).toBe(InsuranceClaimStatus.SUBMITTED);
    });

    it('throws ConflictException if claim already exists for appointment', async () => {
      claimRepoMock.findOne.mockResolvedValue(mockClaim);

      await expect(
        service.createClaim(mockUser as any, {
          appointmentId: 'appt-100',
          providerName: 'Star Health',
          policyNumber: 'POL-123',
          claimAmount: 1000,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('updates status and covered amount when called by ADMIN', async () => {
      claimRepoMock.findOne.mockResolvedValue({ ...mockClaim });
      claimRepoMock.save.mockImplementation((data: any) => Promise.resolve(data));

      const result = await service.updateStatus(
        'claim-001',
        mockAdmin as any,
        InsuranceClaimStatus.APPROVED,
        'Approved by admin',
        900,
      );

      expect(result.status).toBe(InsuranceClaimStatus.APPROVED);
      expect(result.coveredAmount).toBe(900);
      expect(result.copayAmount).toBe(100);
    });

    it('throws ForbiddenException if non-admin attempts status update', async () => {
      await expect(
        service.updateStatus('claim-001', mockUser as any, InsuranceClaimStatus.APPROVED),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
