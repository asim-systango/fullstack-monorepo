import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/auth';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles('admin', 'staff')
  async getMetrics() {
    const metrics = await this.dashboardService.getMetrics();
    return { data: metrics };
  }
}
