import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';

@ApiTags('issues')
@ApiBearerAuth()
@Controller()
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post('projects/:projectId/issues')
  @Roles('staff', 'user', 'admin')
  @ApiOperation({ summary: 'Create issue (transaction: issue + labels + activity)' })
  create(
    @CurrentUser() user: JwtUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateIssueDto,
  ) {
    return this.issuesService.create(user, projectId, dto);
  }

  @Get('projects/:projectId/issues')
  @Roles('staff', 'user', 'admin')
  listForProject(
    @CurrentUser() user: JwtUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListIssuesQueryDto,
  ) {
    return this.issuesService.listForProject(user, projectId, query);
  }

  @Get('issues/mine')
  @Roles('staff', 'user', 'admin')
  @ApiOperation({ summary: 'My open issues dashboard' })
  listMine(@CurrentUser() user: JwtUser, @Query() query: ListIssuesQueryDto) {
    return this.issuesService.listMine(user, query);
  }

  @Get('issues/:id')
  @Roles('staff', 'user', 'admin')
  getOne(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.getOne(user, id);
  }

  @Patch('issues/:id')
  @Roles('staff', 'user', 'admin')
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIssueDto,
  ) {
    return this.issuesService.update(user, id, dto);
  }

  @Patch('issues/:id/status')
  @Roles('staff', 'user', 'admin')
  updateStatus(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIssueStatusDto,
  ) {
    return this.issuesService.updateStatus(user, id, dto);
  }

  @Delete('issues/:id')
  @Roles('staff', 'user', 'admin')
  softDelete(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.softDelete(user, id);
  }

  @Post('issues/:id/comments')
  @Roles('staff', 'user', 'admin')
  addComment(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.issuesService.addComment(user, id, dto);
  }
}
