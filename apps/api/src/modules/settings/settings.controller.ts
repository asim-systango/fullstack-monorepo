import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List all app settings (admin)' })
  @ApiOkResponse({ description: 'All configuration rows' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  list() {
    return this.settingsService.list();
  }

  @Roles('admin')
  @Get(':key')
  @ApiOperation({ summary: 'Get one setting by key (admin)' })
  @ApiOkResponse({ description: 'Setting row' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findOne(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Roles('admin')
  @Patch(':key')
  @ApiOperation({
    summary: 'Update a setting (admin)',
    description:
      'Persists updated_by. New limits apply on the next checkout only (never retroactively).',
  })
  @ApiOkResponse({ description: 'Updated setting' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.settingsService.updateByKey(key, dto, user.id);
  }
}
