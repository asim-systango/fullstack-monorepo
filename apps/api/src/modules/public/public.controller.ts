import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth';
import { ResumesService } from '../resumes/resumes.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly resumes: ResumesService) {}

  @Public()
  @Get('resumes/:slug')
  @ApiOperation({ summary: 'Public published resume by slug' })
  getBySlug(@Param('slug') slug: string) {
    return this.resumes.findPublishedBySlug(slug);
  }
}
