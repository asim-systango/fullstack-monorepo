import { Controller, Get, Param } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth';
import type { PublicUser } from '../users';
import { BalancesService } from './balances.service';

@ApiTags('balances')
@ApiCookieAuth('access_token')
@Controller('groups/:groupId/balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  @ApiOperation({ summary: 'Computed balances for a group' })
  compute(@Param('groupId') groupId: string, @CurrentUser() user: PublicUser) {
    return this.balancesService.compute(groupId, user);
  }
}
