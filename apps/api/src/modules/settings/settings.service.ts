import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './app-setting.entity';
import type { UpdateSettingDto } from './dto/update-setting.dto';
import { AppSettingValueType } from './enums/app-setting-value-type.enum';
import { SETTING_DEFAULTS, SettingKeys, type SettingKey } from './setting-keys';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly settings: Repository<AppSetting>,
  ) {}

  list(): Promise<AppSetting[]> {
    return this.settings.find({ order: { key: 'ASC' } });
  }

  async findByKey(key: string): Promise<AppSetting> {
    const row = await this.settings.findOne({ where: { key } });
    if (!row) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return row;
  }

  async updateByKey(
    key: string,
    dto: UpdateSettingDto,
    adminUserId: string,
  ): Promise<AppSetting> {
    const row = await this.findByKey(key);
    const trimmed = dto.value.trim();
    this.validateValue(row, trimmed);
    row.value = trimmed;
    row.updatedBy = adminUserId;
    return this.settings.save(row);
  }

  async getInteger(key: SettingKey, fallback?: number): Promise<number> {
    const row = await this.settings.findOne({ where: { key } });
    if (!row) {
      if (fallback !== undefined) return fallback;
      const def = SETTING_DEFAULTS[key];
      return Number.parseInt(def.value, 10);
    }
    const n = Number.parseInt(row.value, 10);
    if (!Number.isFinite(n)) {
      throw new BadRequestException(`Setting "${key}" is not a valid integer`);
    }
    return n;
  }

  getMaxActiveLoans(): Promise<number> {
    return this.getInteger(SettingKeys.MaxActiveLoans, 2);
  }

  getFineCentsPerDay(): Promise<number> {
    return this.getInteger(SettingKeys.FineCentsPerDay, 50);
  }

  getDefaultLoanDays(): Promise<number> {
    return this.getInteger(SettingKeys.DefaultLoanDays, 14);
  }

  /** Idempotent insert of known defaults (used by seed / bootstrap). */
  async ensureDefaults(): Promise<void> {
    for (const [key, meta] of Object.entries(SETTING_DEFAULTS)) {
      const existing = await this.settings.findOne({ where: { key } });
      if (existing) continue;
      await this.settings.save(
        this.settings.create({
          key,
          value: meta.value,
          valueType: AppSettingValueType.Integer,
          description: meta.description,
          updatedBy: null,
        }),
      );
    }
  }

  private validateValue(row: AppSetting, value: string): void {
    if (row.valueType === AppSettingValueType.Integer) {
      const n = Number.parseInt(value, 10);
      if (!Number.isFinite(n) || String(n) !== value) {
        throw new BadRequestException('Value must be an integer');
      }
      if (row.key === SettingKeys.MaxActiveLoans && (n < 1 || n > 50)) {
        throw new BadRequestException('max_active_loans must be between 1 and 50');
      }
      if (row.key === SettingKeys.FineCentsPerDay && (n < 0 || n > 10_000)) {
        throw new BadRequestException('fine_cents_per_day must be between 0 and 10000');
      }
      if (row.key === SettingKeys.DefaultLoanDays && (n < 1 || n > 365)) {
        throw new BadRequestException('default_loan_days must be between 1 and 365');
      }
    }
  }
}
