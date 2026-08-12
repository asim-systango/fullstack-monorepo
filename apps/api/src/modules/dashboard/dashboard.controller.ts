import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { GetOverallKpisSwagger } from './decorators/swagger/get-overall-kpis.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overall-kpis')
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.OK)
  @GetOverallKpisSwagger()
  async getOverallKpis() {
    try {
      return await this.dashboardService.getOverallKpis();
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}
