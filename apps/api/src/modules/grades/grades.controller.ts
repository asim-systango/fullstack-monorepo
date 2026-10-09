import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles, CurrentUser } from '../../common/auth';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@ApiTags('grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Roles('staff', 'admin')
  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateGradeDto })
  @ApiOperation({ summary: 'Grade a submission' })
  @ApiCreatedResponse({ description: 'Grade recorded' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() dto: CreateGradeDto, @CurrentUser() user: JwtUser) {
    return this.gradesService.create(dto, user);
  }

  @Roles('user')
  @Get('my')
  @ApiOperation({ summary: 'Get current user grades' })
  findMyGrades(@CurrentUser() user: JwtUser) {
    return this.gradesService.findByStudent(user.id);
  }
}
