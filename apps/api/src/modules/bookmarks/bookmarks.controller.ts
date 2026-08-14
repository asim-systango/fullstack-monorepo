import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, type JwtUser } from '../../common/auth';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@ApiTags('bookmarks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Roles('user')
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.create(user.id, dto);
  }

  @Roles('user')
  @Get()
  findMine(@CurrentUser() user: JwtUser) {
    return this.bookmarksService.findMine(user.id);
  }

  // Path uses jobId (not bookmark id) so candidates can unsave from a job card without a lookup.
  @Roles('user')
  @Delete(':jobId')
  remove(@Param('jobId') jobId: string, @CurrentUser() user: JwtUser) {
    return this.bookmarksService.removeByJobId(user.id, jobId);
  }
}
