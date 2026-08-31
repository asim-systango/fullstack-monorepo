import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  type JwtUser,
} from '../../common/auth';
import { CloudinaryService } from './cloudinary.service';
import { ResumeMetaService } from './resume-meta.service';
import { CreateResumeMetaDto } from './dto/create-resume-meta.dto';
import { UpdateResumeMetaDto } from './dto/update-resume-meta.dto';

@ApiTags('resumes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resumes')
export class ResumeMetaController {
  constructor(
    private readonly resumeMetaService: ResumeMetaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Declared before :id routes for clarity — POST path does not collide with GET :id.
  @Roles('user')
  @Post('upload-signature')
  uploadSignature(@CurrentUser() user: JwtUser) {
    return this.cloudinaryService.generateUploadSignature(user.id);
  }

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
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.resumeMetaService.findOwnedOrThrow(id, user.id);
  }

  @Roles('user')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateResumeMetaDto,
  ) {
    return this.resumeMetaService.update(id, user.id, dto);
  }

  @Roles('user')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.resumeMetaService.remove(id, user.id);
  }
}
