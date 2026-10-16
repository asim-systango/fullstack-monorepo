import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { ListResumesQueryDto } from './dto/list-resumes-query.dto';
import { ResumesService } from './resumes.service';

@ApiTags('admin-resumes')
@ApiBearerAuth()
@Roles('admin')
@Controller('admin/resumes')
export class AdminResumesController {
  constructor(private readonly resumes: ResumesService) {}

  @Get()
  @ApiOperation({ summary: 'List all resumes (admin)' })
  list(@Query() query: ListResumesQueryDto) {
    return this.resumes.listAll(query);
  }
}
