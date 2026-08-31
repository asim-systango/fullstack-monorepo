import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common/auth';
import { CompaniesService } from '../companies/companies.service';
import { JobsService } from '../jobs/jobs.service';

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly jobsService: JobsService,
  ) {}

  @Get('companies')
  listCompanies() {
    return this.companiesService.findAll();
  }

  @Post('companies/:id/suspend')
  suspendCompany(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.suspend(id);
  }

  @Post('companies/:id/reactivate')
  reactivateCompany(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.reactivate(id);
  }

  // Delegates to existing JobsService.forceClose — do not duplicate the transaction here.
  @Post('jobs/:id/force-close')
  forceCloseJob(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.forceClose(id);
  }
}
