import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentRepository } from '../appointment/repositories/appointment.repository';
import { JwtUser } from '../../common/auth';

@Injectable()
export class FhirService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  /**
   * Generates a FHIR R4 JSON Bundle for a given appointment.
   */
  async generateFhirBundle(appointmentId: string, user?: JwtUser) {
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required to export clinical records',
      );
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${appointmentId}" not found`);
    }

    this.validateOwnership(appointment, user);

    const now = new Date().toISOString();
    const patientName = `Patient (${appointment.patientId.slice(0, 8)})`;
    const doctorName = appointment.slot?.doctor
      ? `Dr. ${appointment.slot.doctor.firstName} ${appointment.slot.doctor.lastName}`
      : 'Dr. Practitioner';

    const entry: Record<string, unknown>[] = [
      {
        fullUrl: `urn:uuid:patient-${appointment.patientId}`,
        resource: {
          resourceType: 'Patient',
          id: `patient-${appointment.patientId}`,
          name: [
            {
              use: 'official',
              text: patientName,
            },
          ],
        },
      },
      {
        fullUrl: `urn:uuid:practitioner-${appointment.slot?.doctorId || 'unknown'}`,
        resource: {
          resourceType: 'Practitioner',
          id: `practitioner-${appointment.slot?.doctorId || 'unknown'}`,
          name: [
            {
              use: 'official',
              text: doctorName,
            },
          ],
          qualification: appointment.slot?.doctor?.qualification
            ? [
                {
                  code: {
                    text: appointment.slot.doctor.qualification,
                  },
                },
              ]
            : [],
        },
      },
      {
        fullUrl: `urn:uuid:encounter-${appointment.id}`,
        resource: {
          resourceType: 'Encounter',
          id: `encounter-${appointment.id}`,
          status: appointment.status.toLowerCase(),
          class: {
            // eslint-disable-next-line sonarjs/no-clear-text-protocols
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'AMB',
            display: 'ambulatory',
          },
          subject: {
            reference: `urn:uuid:patient-${appointment.patientId}`,
            display: patientName,
          },
          participant: [
            {
              individual: {
                reference: `urn:uuid:practitioner-${appointment.slot?.doctorId || 'unknown'}`,
                display: doctorName,
              },
            },
          ],
          period: {
            start: appointment.slot?.startsAt
              ? new Date(appointment.slot.startsAt).toISOString()
              : now,
            end: appointment.slot?.endsAt
              ? new Date(appointment.slot.endsAt).toISOString()
              : now,
          },
        },
      },
      {
        fullUrl: `urn:uuid:condition-${appointment.id}`,
        resource: {
          resourceType: 'Condition',
          id: `condition-${appointment.id}`,
          clinicalStatus: {
            coding: [
              {
                // eslint-disable-next-line sonarjs/no-clear-text-protocols
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
              },
            ],
          },
          subject: {
            reference: `urn:uuid:patient-${appointment.patientId}`,
          },
          code: {
            text: appointment.reason || 'General Medical Consultation',
          },
        },
      },
    ];

    if (appointment.prescription?.medicines) {
      const medicines = appointment.prescription.medicines as Array<
        Record<string, string>
      >;
      medicines.forEach((med, index) => {
        entry.push({
          fullUrl: `urn:uuid:medication-request-${appointment.id}-${index}`,
          resource: {
            resourceType: 'MedicationRequest',
            id: `medication-request-${appointment.id}-${index}`,
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
              text: med.name || med.medicineName || 'Prescribed Medicine',
            },
            subject: {
              reference: `urn:uuid:patient-${appointment.patientId}`,
            },
            dosageInstruction: [
              {
                text:
                  `${med.dosage || ''} ${med.frequency || ''} - ${med.duration || ''}`.trim() ||
                  'As directed',
              },
            ],
          },
        });
      });
    }

    return {
      resourceType: 'Bundle',
      id: `bundle-${appointment.id}`,
      type: 'document',
      timestamp: now,
      identifier: {
        system: 'urn:ietf:rfc:3986',
        value: `urn:uuid:${appointment.id}`,
      },
      entry,
    };
  }

  /**
   * Generates HL7 v2.5 ORU^R01 text stream for a given appointment.
   */
  async generateHl7Message(appointmentId: string, user?: JwtUser): Promise<string> {
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required to export clinical records',
      );
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${appointmentId}" not found`);
    }

    this.validateOwnership(appointment, user);

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14);
    const patientName = `Patient^(${appointment.patientId.slice(0, 8)})`;
    const doctorName = appointment.slot?.doctor
      ? `${appointment.slot.doctor.lastName}^${appointment.slot.doctor.firstName}`
      : 'Doctor^Practitioner';

    const msh = `MSH|^~\\&|PULSECARE_EMR|HOSPITAL_SYS|RECEIVING_APP|RECEIVING_FAC|${timestamp}||ORU^R01|MSG${appointment.id.slice(0, 8)}|P|2.5`;
    const pid = `PID|1||${appointment.patientId}^^^HOSPITAL||${patientName}|||||||||||||`;
    const pv1 = `PV1|1|O|CLINIC1||||${doctorName}|||||||||||${appointment.id}|||||||||||||||||||||||||${timestamp}`;
    const obr = `OBR|1|${appointment.id}|${appointment.id}|CONSULT^Consultation Visit|||${timestamp}`;
    const obxReason = `OBX|1|TX|REASON^Chief Complaint||${appointment.reason || 'General Consultation'}||||||F`;

    let hl7 = [msh, pid, pv1, obr, obxReason].join('\r\n');

    if (appointment.prescription?.medicines) {
      const medicines = appointment.prescription.medicines as Array<
        Record<string, string>
      >;
      medicines.forEach((med, index) => {
        const medText = `${med.name || med.medicineName || 'Medicine'}: ${med.dosage || ''} ${med.frequency || ''}`;
        hl7 += `\r\nOBX|${index + 2}|TX|PRESCRIPTION^Medication||${medText}||||||F`;
      });
    }

    return hl7;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateOwnership(appointment: any, user: JwtUser) {
    if (user.role === 'PATIENT') {
      if (appointment.patientId !== user.id) {
        throw new ForbiddenException(
          'Patients can only export their own medical records',
        );
      }
    } else if (user.role === 'DOCTOR') {
      if (appointment.slot) {
        // If doctor details present
        // note: doctor logic handles scoping
      }
    }
  }
}
