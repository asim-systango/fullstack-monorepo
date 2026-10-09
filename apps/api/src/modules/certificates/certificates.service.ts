import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './certificate.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async create(enrollmentId: string) {
    const certificate = this.certificateRepository.create({
      enrollmentId,
      issuedAt: new Date(),
    });
    return this.certificateRepository.save(certificate);
  }

  async findByStudent(studentId: string) {
    return this.certificateRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .where('enrollment.studentId = :studentId', { studentId })
      .orderBy('certificate.issuedAt', 'DESC')
      .getMany();
  }
}
