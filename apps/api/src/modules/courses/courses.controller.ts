import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Public, Roles, CurrentUser } from '../../common/auth';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'List published courses' })
  @ApiOkResponse({ description: 'Published courses returned' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search term for title, description, or slug',
  })
  findAll(@Query('q') q?: string) {
    return this.coursesService.findPublished(q);
  }

  @Roles('admin')
  @Get('admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'List all courses for admin' })
  @ApiOkResponse({ description: 'All courses returned' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search term for title, description, or slug',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAllAdmin(@Query('q') q?: string) {
    return this.coursesService.findAllAdmin(q);
  }

  @Roles('staff', 'admin')
  @Get('mine')
  @HttpCode(200)
  @ApiOperation({ summary: 'List courses owned by the instructor' })
  @ApiOkResponse({ description: 'Instructor courses returned' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findMine(@CurrentUser() user: JwtUser, @Query('q') q?: string) {
    return this.coursesService.findInstructorCourses(user.id, q);
  }

  @Roles('staff', 'admin')
  @Get('mine/dashboard')
  @HttpCode(200)
  @ApiOperation({ summary: 'Instructor dashboard — ungraded submissions' })
  @ApiOkResponse({ description: 'Ungraded submissions count returned' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findMineDashboard(
    @CurrentUser() user: JwtUser,
    @Query('instructorId') instructorId?: string,
  ) {
    return this.coursesService.findInstructorDashboard(user, instructorId);
  }

  @Public()
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get published course details' })
  @ApiOkResponse({ description: 'Course details returned' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findPublishedById(id);
  }

  @Roles('staff', 'admin')
  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateCourseDto })
  @ApiOperation({ summary: 'Create a new course' })
  @ApiCreatedResponse({ description: 'Course created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: JwtUser) {
    return this.coursesService.create(dto, user);
  }

  @Roles('staff', 'admin')
  @Patch(':id')
  @HttpCode(200)
  @ApiBody({ type: UpdateCourseDto })
  @ApiOperation({ summary: 'Update an existing course' })
  @ApiOkResponse({ description: 'Course updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @Roles('staff', 'admin')
  @Patch(':id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish a course' })
  @ApiOkResponse({ description: 'Course published' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  publish(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.coursesService.publish(id, user);
  }

  @Roles('staff', 'admin')
  @Patch(':id/unpublish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unpublish a course' })
  @ApiOkResponse({ description: 'Course unpublished' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  unpublish(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.coursesService.unpublish(id, user);
  }

  @Roles('staff', 'admin')
  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft delete a course' })
  @ApiOkResponse({ description: 'Course deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.coursesService.softDelete(id, user);
  }
}
