import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, type JwtUser } from '../../common/auth';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('staff')
  @Get()
  staff(@CurrentUser() user: JwtUser) {
    return this.dashboardService.staffDashboard(user.id);
  }
}
