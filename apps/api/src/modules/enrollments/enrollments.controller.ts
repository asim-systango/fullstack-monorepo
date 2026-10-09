import { Controller, Post, Body, Get, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles, CurrentUser } from '../../common/auth';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles('admin')
  @Get('admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'List all enrollments for admin' })
  @ApiOkResponse({ description: 'All enrollments returned' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAllAdmin() {
    return this.enrollmentsService.findAllAdmin();
  }

  @Roles('user', 'staff', 'admin')
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'List enrollments' })
  @ApiOkResponse({ description: 'Enrollment list returned' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query('courseId') courseId: string | undefined, @CurrentUser() user: JwtUser) {
    return this.enrollmentsService.findAll(user, courseId);
  }

  @Roles('user')
  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateEnrollmentDto })
  @ApiOperation({ summary: 'Create a course enrollment' })
  @ApiCreatedResponse({ description: 'Enrollment created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: JwtUser) {
    return this.enrollmentsService.create(dto, user);
  }
}
