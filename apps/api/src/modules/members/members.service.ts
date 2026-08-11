import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberProfile } from './member-profile.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberProfile)
    private readonly members: Repository<MemberProfile>,
  ) {}

  // Scaffold — ensure profile, suspend/reactivate next.
  findByUserId(_userId: string): Promise<MemberProfile | null> {
    return Promise.resolve(null);
  }
}
