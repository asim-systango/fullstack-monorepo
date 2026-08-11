import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './app-setting.entity';
import type { UpdateLoanLimitDto } from './dto/update-loan-limit.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly settings: Repository<AppSetting>,
  ) {}

  // Scaffold — read/write keyed settings (max_active_loans, etc.) next.
  list(): Promise<AppSetting[]> {
    return Promise.resolve([]);
  }

  updateLoanLimit(_dto: UpdateLoanLimitDto, _adminUserId: string): Promise<AppSetting> {
    throw new Error('Not implemented');
  }
}
