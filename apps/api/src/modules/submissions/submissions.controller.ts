import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles, CurrentUser } from '../../common/auth';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Roles('user')
  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateSubmissionDto })
  @ApiOperation({ summary: 'Submit a quiz' })
  @ApiCreatedResponse({ description: 'Submission created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() dto: CreateSubmissionDto, @CurrentUser() user: JwtUser) {
    return this.submissionsService.create(dto, user);
  }

  @Roles('staff', 'admin')
  @Get('ungraded')
  @ApiOperation({ summary: 'Get ungraded submissions for instructor' })
  findUngraded(@CurrentUser() user: JwtUser) {
    return this.submissionsService.findUngraded(user);
  }
}
