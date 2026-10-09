import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/auth';
import type { JwtUser } from '../../common/auth/jwt-user';
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto';

@Controller('projects/:projectId/sprints')
export class SprintsController {
  constructor(private readonly sprints: SprintsService) {}

  @Get()
  list(@Param('projectId') p: string, @CurrentUser() u: JwtUser) {
    return this.sprints.list(p, u);
  }

  @Post()
  create(
    @Param('projectId') p: string,
    @Body() dto: CreateSprintDto,
    @CurrentUser() u: JwtUser,
  ) {
    return this.sprints.create(p, dto, u);
  }
}
