import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateDoctorDto, DoctorDocumentDto } from './create-doctor.dto';
import { UpdateDoctorDto } from './update-doctor.dto';

describe('CreateDoctorDto & DoctorDocumentDto', () => {
  it('validates DoctorDocumentDto correctly', async () => {
    const doc = plainToInstance(DoctorDocumentDto, {
      id: 'doc-1785933',
      name: 'medical_license.pdf',
      type: 'Medical Council License',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/license.pdf',
      status: 'PENDING',
      uploadedAt: '2026-08-13',
    });

    const errors = await validate(doc);
    expect(errors.length).toBe(0);
  });

  it('validates CreateDoctorDto with documents array', async () => {
    const payload = {
      userId: '22c5a8c2-79cf-40f9-afd3-9d2934a8ec60',
      firstName: 'Jane',
      lastName: 'Doe',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD',
      documents: [
        {
          id: 'doc-101',
          name: 'degree.pdf',
          type: 'Degree Certificate',
          url: '/objects/degree.pdf',
          status: 'PENDING',
          uploadedAt: '2026-08-13',
        },
      ],
    };

    const dto = plainToInstance(CreateDoctorDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.documents).toHaveLength(1);
    expect(dto.documents?.[0]?.name).toBe('degree.pdf');
  });

  it('validates UpdateDoctorDto with documents array', async () => {
    const payload = {
      documents: [
        {
          id: 'doc-102',
          name: 'license.pdf',
          type: 'Medical License',
          url: '/objects/license.pdf',
          status: 'VERIFIED',
          uploadedAt: '2026-08-13',
        },
      ],
    };

    const dto = plainToInstance(UpdateDoctorDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.documents).toHaveLength(1);
    expect(dto.documents?.[0]?.status).toBe('VERIFIED');
  });
});
