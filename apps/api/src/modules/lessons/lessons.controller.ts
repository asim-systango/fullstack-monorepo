import { Controller, Post, Patch, Delete, Body, Param, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles, CurrentUser } from '../../common/auth';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Roles('staff', 'admin')
  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateLessonDto })
  @ApiOperation({ summary: 'Create a lesson' })
  @ApiCreatedResponse({ description: 'Lesson created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() dto: CreateLessonDto, @CurrentUser() user: JwtUser) {
    return this.lessonsService.create(dto, user);
  }

  @Roles('staff', 'admin')
  @Patch(':id')
  @HttpCode(200)
  @ApiBody({ type: UpdateLessonDto })
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiOkResponse({ description: 'Lesson updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.lessonsService.update(id, dto, user);
  }

  @Roles('staff', 'admin')
  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiOkResponse({ description: 'Lesson deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.lessonsService.remove(id, user);
  }
}
