import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { UpdateLoanLimitDto } from './dto/update-loan-limit.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles('staff', 'admin')
  @Get()
  @ApiOperation({ summary: 'List app settings' })
  list() {
    return this.settingsService.list();
  }

  @Roles('admin')
  @Patch('loan-limit')
  @ApiOperation({ summary: 'Update max_active_loans (admin)' })
  updateLoanLimit(@CurrentUser() user: JwtUser, @Body() dto: UpdateLoanLimitDto) {
    return this.settingsService.updateLoanLimit(dto, user.id);
  }
}
