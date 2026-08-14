import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';
import { DashboardService } from './dashboard.service';

export class PublicDashboardDto {
  @ApiProperty()
  totalTitles!: number;

  @ApiProperty()
  availableCopies!: number;
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Public landing stats' })
  @ApiOkResponse({ type: PublicDashboardDto })
  publicStats() {
    return this.dashboardService.publicStats();
  }

  @Roles('user')
  @Get('member')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Member home dashboard' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  member(@CurrentUser() user: JwtUser) {
    return this.dashboardService.memberDashboard(user.id);
  }

  @Roles('staff')
  @Get('librarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Librarian home dashboard' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  librarian() {
    return this.dashboardService.librarianDashboard();
  }

  @Roles('admin')
  @Get('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin home dashboard' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  admin() {
    return this.dashboardService.adminDashboard();
  }
}
