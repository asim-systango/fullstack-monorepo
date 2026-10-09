import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth/jwt-user';
import { ProjectsService } from './projects.service';
import { MembershipService } from './membership.service';
import { AddMemberDto, CreateProjectDto, UpdateProjectDto } from './dto';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly membership: MembershipService,
  ) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.projects.list(user);
  }

  @Post()
  @Roles('staff')
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtUser) {
    return this.projects.create(dto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.projects.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.projects.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.projects.remove(id, user);
  }

  @Get(':id/members')
  members(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.projects.listMembers(id, user);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.projects.addMember(id, dto, user);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtUser,
  ) {
    await this.membership.assertLead(id, user);
    return this.projects.removeMember(id, userId);
  }
}
