import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('staff', 'admin')
  @ApiOperation({ summary: 'Create a project (staff = project lead)' })
  create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateProjectDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.projectsService.create(user, dto, authorization);
  }

  @Get()
  @Roles('staff', 'user', 'admin')
  @ApiOperation({ summary: 'List projects (joined; admin sees all)' })
  list(@CurrentUser() user: JwtUser, @Query() query: ListProjectsQueryDto) {
    return this.projectsService.list(user, query);
  }

  @Get(':id')
  @Roles('staff', 'user', 'admin')
  getOne(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getOne(user, id);
  }

  @Patch(':id')
  @Roles('staff', 'user', 'admin')
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('staff', 'user', 'admin')
  remove(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(user, id);
  }

  @Get(':id/members')
  @Roles('staff', 'user', 'admin')
  listMembers(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.listMembers(user, id);
  }

  @Post(':id/members')
  @Roles('staff', 'user', 'admin')
  addMember(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.projectsService.addMember(user, id, dto, authorization);
  }

  @Delete(':id/members/:userId')
  @Roles('staff', 'user', 'admin')
  removeMember(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.removeMember(user, id, userId);
  }
}
