import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { GetOverallKpisSwagger } from './decorators/swagger/get-overall-kpis.decorator';
import { GetCrmKpisSwagger } from './decorators/swagger/get-crm-kpis.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { CurrentUser } from '../../common/auth';
import { User } from '../../database/entities/user.entity';
import { DASHBOARD_MESSAGES, DASHBOARD_ERRORS } from './constants/dashboard.constants';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard, RoutePermissionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overall-kpis')
  @HttpCode(HttpStatus.OK)
  @GetOverallKpisSwagger()
  async getOverallKpis() {
    try {
      const result = await this.dashboardService.getOverallKpis();
      return {
        message: DASHBOARD_MESSAGES.OVERALL_KPIS_RETRIEVED,
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(DASHBOARD_ERRORS.FETCH_FAILED);
    }
  }

  @Get('crm-kpis')
  @HttpCode(HttpStatus.OK)
  @GetCrmKpisSwagger()
  async getCrmKpis(@CurrentUser() user: User) {
    try {
      const userRole = user.role?.name || '';
      const result = await this.dashboardService.getCrmKpis(user, userRole);
      return {
        message: DASHBOARD_MESSAGES.CRM_KPIS_RETRIEVED,
        data: result,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(DASHBOARD_ERRORS.FETCH_FAILED);
    }
  }
}
