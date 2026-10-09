import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/auth';
import type { JwtUser } from '../../common/auth/jwt-user';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto';

@Controller('projects/:projectId/labels')
export class LabelsController {
  constructor(private readonly labels: LabelsService) {}

  @Get()
  list(@Param('projectId') projectId: string, @CurrentUser() user: JwtUser) {
    return this.labels.list(projectId, user);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateLabelDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.labels.create(projectId, dto, user);
  }

  @Delete(':id')
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.labels.remove(projectId, id, user);
  }
}
