import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, type JwtUser } from '../../common/auth';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-status.dto';

@ApiTags('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Roles('user')
  @Post('jobs/:jobId/applications')
  create(
    @Param('jobId') jobId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(user.id, jobId, dto);
  }

  @Roles('user')
  @Get('my/applications')
  findMine(@CurrentUser() user: JwtUser) {
    return this.applicationsService.findMine(user.id);
  }

  @Roles('staff')
  @Get('company/applications')
  findForOwner(@CurrentUser() user: JwtUser, @Query('status') status?: ApplicationStatus) {
    return this.applicationsService.findForOwner(user.id, status);
  }

  @Roles('staff')
  @Get('company/applications/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.applicationsService.findOneOwnedByStaff(id, user.id);
  }

  @Roles('staff')
  @Patch('applications/:id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, user.id, dto);
  }
}