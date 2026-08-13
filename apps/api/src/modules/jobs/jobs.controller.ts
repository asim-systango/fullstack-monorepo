import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Public, Roles, RolesGuard, type JwtUser } from '../../common/auth';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { CompaniesService } from '../companies/companies.service';

@ApiTags('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly companiesService: CompaniesService
) {}

  @Public()
  @Get('jobs')
  findAll(@Query() query: ListJobsQueryDto) {
    return this.jobsService.findAllPublic(query);
  }

  @Public()
  @Get('jobs/:id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOnePublic(id);
  }

  @Roles('staff')
  @Get('company/jobs')
  async findMine(@CurrentUser() user: JwtUser) {
    const company = await this.companiesService.findByUserIdOrThrow(user.id);
    return this.jobsService.findAllForOwner(company.id);
  }

  @Roles('staff')
  @Post('jobs')
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.id, dto);
  }

  @Roles('staff')
  @Patch('jobs/:id')
  update(@Param('id') id: string, @CurrentUser() user: JwtUser, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, user.id, dto);
  }

  @Roles('staff')
  @Delete('jobs/:id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.jobsService.remove(id, user.id);
  }
}