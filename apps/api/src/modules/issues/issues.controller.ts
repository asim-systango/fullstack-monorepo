import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/auth';
import type { JwtUser } from '../../common/auth/jwt-user';
import { IssuesService } from './issues.service';
import { ChangeStatusDto, CreateCommentDto, CreateIssueDto, IssueFilterDto } from './dto';
import { AssignSprintDto } from '../sprints/dto';

@Controller()
export class IssuesController {
  constructor(private readonly issues: IssuesService) {}

  @Get('projects/:projectId/issues')
  list(
    @Param('projectId') projectId: string,
    @Query() filter: IssueFilterDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issues.list(projectId, filter, user);
  }

  @Post('projects/:projectId/issues')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateIssueDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issues.create(projectId, dto, user);
  }

  @Get('issues/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.issues.findOne(id, user);
  }

  @Patch('issues/:id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issues.changeStatus(id, dto, user);
  }

  @Delete('issues/:id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.issues.remove(id, user);
  }

  @Patch('issues/:id/sprint')
  assignSprint(
    @Param('id') id: string,
    @Body() dto: AssignSprintDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issues.assignSprint(id, dto.sprintId ?? null, user);
  }

  @Post('issues/:id/comments')
  comment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issues.addComment(id, dto, user);
  }

  @Post('issues/:id/labels/:labelId')
  addLabel(
    @Param('id') id: string,
    @Param('labelId') labelId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issues.addLabel(id, labelId, user);
  }

  @Delete('issues/:id/labels/:labelId')
  removeLabel(
    @Param('id') id: string,
    @Param('labelId') labelId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issues.removeLabel(id, labelId, user);
  }
}
