import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, type JwtUser } from '../../common/auth';
import { ResumeMetaService } from './resume-meta.service';
import { CreateResumeMetaDto } from './dto/create-resume-meta.dto';
import { UpdateResumeMetaDto } from './dto/update-resume-meta.dto';

@ApiTags('resumes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resumes')
export class ResumeMetaController {
  constructor(private readonly resumeMetaService: ResumeMetaService) {}

  @Roles('user')
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateResumeMetaDto) {
    return this.resumeMetaService.create(user.id, dto);
  }

  @Roles('user')
  @Get()
  findMine(@CurrentUser() user: JwtUser) {
    return this.resumeMetaService.findMine(user.id);
  }

  @Roles('user')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.resumeMetaService.findOwnedOrThrow(id, user.id);
  }

  @Roles('user')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateResumeMetaDto,
  ) {
    return this.resumeMetaService.update(id, user.id, dto);
  }

  @Roles('user')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.resumeMetaService.remove(id, user.id);
  }
}
