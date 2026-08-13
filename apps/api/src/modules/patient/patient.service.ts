import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from './entities/patient-profile.entity';

/**
 * Service for managing patient profiles.
 *
 * Every user with role='PATIENT' can optionally have a PatientProfile row
 * that stores health-specific data. This service provides CRUD operations
 * and an auto-sync utility (mirrors the DoctorService.syncUsersToDoctorProfiles pattern).
 */
@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);

  constructor(
    @InjectRepository(PatientProfile)
    private readonly repo: Repository<PatientProfile>,
  ) {}

  /**
   * Auto-creates a blank patient_profiles row for every PATIENT user
   * that doesn't already have one. Called lazily on findAll / findByUserId.
   */
  async syncUsersToPatientProfiles(
    dataSource: import('typeorm').DataSource,
  ): Promise<void> {
    try {
      const patientUsers: Array<{
        id: string;
        first_name?: string;
        last_name?: string;
        name?: string;
        avatar_url?: string;
      }> = await dataSource
        .query(
          `SELECT id, first_name, last_name, name, avatar_url
           FROM users
           WHERE UPPER(role) = 'PATIENT'`,
        )
        .catch(() => []);

      for (const u of patientUsers) {
        const existing = await this.repo.findOne({ where: { userId: u.id } });
        if (!existing) {
          const firstName =
            u.first_name || (u.name ? u.name.split(' ')[0] : null) || null;
          const lastName =
            u.last_name || (u.name ? u.name.split(' ').slice(1).join(' ') : null) || null;

          const profile = this.repo.create({
            userId: u.id,
            firstName,
            lastName,
            profileImage: u.avatar_url ?? null,
          });
          await this.repo.save(profile);
          this.logger.log(`Auto-created patient profile for user ${u.id}`);
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to auto-sync patient profiles: ${(err as Error).message}`);
    }
  }

  /** Find all patient profiles. */
  async findAll(): Promise<PatientProfile[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  /** Find a profile by its primary key (profile id). */
  async findOne(id: string): Promise<PatientProfile> {
    const profile = await this.repo.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Patient profile with ID "${id}" not found`);
    }
    return profile;
  }

  /** Find a patient profile by the linked user id. */
  async findByUserId(userId: string): Promise<PatientProfile | null> {
    return this.repo.findOne({ where: { userId } });
  }

  /** Create a new patient profile. */
  async create(data: Partial<PatientProfile>): Promise<PatientProfile> {
    const profile = this.repo.create(data);
    return this.repo.save(profile);
  }

  /** Partial update — only provided fields are changed. */
  async update(id: string, data: Partial<PatientProfile>): Promise<PatientProfile> {
    const existing = await this.findOne(id); // throws 404 if missing
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  /** Update by userId (upsert-style: create if not existing). */
  async upsertByUserId(
    userId: string,
    data: Partial<PatientProfile>,
  ): Promise<PatientProfile> {
    let profile = await this.repo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.repo.create({ userId, ...data });
    } else {
      Object.assign(profile, data);
    }
    return this.repo.save(profile);
  }
}
