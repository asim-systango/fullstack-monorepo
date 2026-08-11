import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { MemberProfile } from './member-profile.entity';
import { MemberStatus } from './enums/member-status.enum';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberProfile)
    private readonly members: Repository<MemberProfile>,
  ) {}

  findByUserId(userId: string): Promise<MemberProfile | null> {
    return this.members.findOne({ where: { userId } });
  }

  /**
   * Idempotent provision — return existing row for userId if present.
   * Concurrent inserts race on UNIQUE(user_id); re-read on conflict.
   */
  async provision(input: {
    userId: string;
    email: string;
    fullName: string;
  }): Promise<MemberProfile> {
    const existing = await this.findByUserId(input.userId);
    if (existing) return existing;

    try {
      return await this.members.save(
        this.members.create({
          userId: input.userId,
          email: input.email.toLowerCase(),
          fullName: input.fullName,
          status: MemberStatus.Active,
        }),
      );
    } catch (err) {
      if (isUniqueViolation(err)) {
        const again = await this.findByUserId(input.userId);
        if (again) return again;
      }
      throw err;
    }
  }

  async syncMirrors(
    userId: string,
    input: { email?: string; fullName?: string },
  ): Promise<MemberProfile | null> {
    const profile = await this.findByUserId(userId);
    if (!profile) return null;
    if (input.email !== undefined) profile.email = input.email.toLowerCase();
    if (input.fullName !== undefined) profile.fullName = input.fullName;
    return this.members.save(profile);
  }
}
