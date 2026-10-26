import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ListResumesQueryDto } from './dto/list-resumes-query.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumesService } from './resumes.service';

@ApiTags('resumes')
@ApiBearerAuth()
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumes: ResumesService) {}

  @Get()
  @Roles('user')
  @ApiOperation({ summary: 'List own resumes (paginated + filters)' })
  list(@CurrentUser() user: JwtUser, @Query() query: ListResumesQueryDto) {
    return this.resumes.listOwn(user.id, query);
  }

  @Post()
  @Roles('user')
  @ApiOperation({ summary: 'Create a draft resume' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateResumeDto) {
    return this.resumes.create(user.id, dto);
  }

  @Get(':id')
  @Roles('user')
  @ApiOperation({ summary: 'Get own resume with sections and items' })
  getOne(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.resumes.findOwned(id, user.id);
  }

  @Put(':id')
  @Roles('user')
  @ApiOperation({ summary: 'Save full draft (resume + sections + items)' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumes.update(id, user.id, dto);
  }

  @Post(':id/publish')
  @Roles('user')
  @ApiOperation({ summary: 'Publish resume (enforces invariant)' })
  publish(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.resumes.publish(id, user.id);
  }

  @Post(':id/unpublish')
  @Roles('user')
  @ApiOperation({ summary: 'Unpublish resume back to draft' })
  unpublish(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.resumes.unpublish(id, user.id);
  }

  @Post(':id/duplicate')
  @Roles('user')
  @ApiOperation({ summary: 'Duplicate resume + sections + items in a transaction' })
  duplicate(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.resumes.duplicate(id, user.id);
  }

  @Delete(':id')
  @Roles('user')
  @ApiOperation({ summary: 'Soft-delete own resume' })
  remove(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.resumes.softDelete(id, user.id);
  }
}
