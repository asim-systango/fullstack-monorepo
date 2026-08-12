import {
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { FhirService } from './fhir.service';

describe('FhirService (Unit)', () => {
  let service: FhirService;
  let appointmentRepoMock: any;

  const mockUser = {
    id: 'patient-123',
    email: 'patient@example.com',
    role: 'PATIENT',
  };

  const mockAppointment = {
    id: 'appt-999',
    patientId: 'patient-123',
    status: 'SCHEDULED',
    reason: 'Routine Cardiology Checkup',
    createdAt: new Date(),
    patient: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'patient@example.com',
    },
    slot: {
      doctorId: 'doc-888',
      startsAt: new Date(),
      endsAt: new Date(),
      doctor: {
        firstName: 'Alex',
        lastName: 'Smith',
        qualification: 'MD Cardiology',
      },
    },
    prescription: {
      medicines: [
        {
          name: 'Aspirin',
          dosage: '100mg',
          frequency: 'Once daily',
          duration: '30 days',
        },
      ],
    },
  };

  beforeEach(() => {
    appointmentRepoMock = {
      findById: jest.fn(),
    };

    service = new FhirService(appointmentRepoMock);
  });

  describe('generateFhirBundle', () => {
    it('returns a valid FHIR R4 Bundle JSON', async () => {
      appointmentRepoMock.findById.mockResolvedValue(mockAppointment);

      const result = await service.generateFhirBundle('appt-999', mockUser as any);

      expect(result.resourceType).toBe('Bundle');
      expect(result.type).toBe('document');
      expect(result.entry.length).toBeGreaterThanOrEqual(4);
      expect((result.entry[0]!.resource as any).resourceType).toBe('Patient');
      expect((result.entry[1]!.resource as any).resourceType).toBe('Practitioner');
      expect((result.entry[2]!.resource as any).resourceType).toBe('Encounter');
    });

    it('throws UnauthorizedException if user context is missing', async () => {
      await expect(service.generateFhirBundle('appt-999', undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException if patient tries to export another patient record', async () => {
      appointmentRepoMock.findById.mockResolvedValue(mockAppointment);
      const otherUser = { ...mockUser, id: 'patient-other' };

      await expect(
        service.generateFhirBundle('appt-999', otherUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generateHl7Message', () => {
    it('returns a formatted HL7 v2.5 message string with MSH and PID segments', async () => {
      appointmentRepoMock.findById.mockResolvedValue(mockAppointment);

      const result = await service.generateHl7Message('appt-999', mockUser as any);

      expect(result).toContain('MSH|^~\\&|PULSECARE_EMR|HOSPITAL_SYS');
      expect(result).toContain('PID|1||patient-123^^^HOSPITAL||Patient^(patient-)');
      expect(result).toContain('OBR|1|appt-999|appt-999|CONSULT^Consultation Visit');
      expect(result).toContain('PRESCRIPTION^Medication||Aspirin: 100mg Once daily');
    });
  });
});
