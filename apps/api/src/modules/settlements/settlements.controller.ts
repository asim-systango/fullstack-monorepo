import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth';
import type { PublicUser } from '../users';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@ApiCookieAuth('access_token')
@Controller('groups/:groupId/settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a settlement for money owed to the current user',
  })
  create(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: CreateSettlementDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.settlementsService.create(groupId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Settlement history for a group' })
  findAll(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.settlementsService.findByGroup(groupId, user);
  }
}
