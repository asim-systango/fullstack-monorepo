import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';

@ApiTags('labels')
@ApiBearerAuth()
@Controller('projects/:projectId/labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  @Roles('staff', 'user', 'admin')
  create(
    @CurrentUser() user: JwtUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.create(user, projectId, dto);
  }

  @Get()
  @Roles('staff', 'user', 'admin')
  list(
    @CurrentUser() user: JwtUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.labelsService.list(user, projectId);
  }

  @Delete(':labelId')
  @Roles('staff', 'admin')
  remove(
    @CurrentUser() user: JwtUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.labelsService.remove(user, projectId, labelId);
  }
}
