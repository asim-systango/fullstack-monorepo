import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { CurrentUser } from '../../common/auth';
import { SwaggerCreateActivity } from './decorators/swagger/create-activity.decorator';
import { SwaggerGetAllActivities } from './decorators/swagger/get-all-activities.decorator';
import { ACTIVITIES_ERRORS, ACTIVITIES_MESSAGES } from './constants/activities.constants';

@ApiTags('Activities')
@ApiBearerAuth()
@Controller('api/v1/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.CREATED)
  @SwaggerCreateActivity()
  async createActivity(
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser() user: User,
  ) {
    try {
      const activity = await this.activitiesService.createActivity(
        createActivityDto,
        user,
        user.role?.name || '',
      );

      return {
        message: ACTIVITIES_MESSAGES.ACTIVITY_CREATED,
        data: activity,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case ACTIVITIES_ERRORS.LEAD_OR_DEAL_REQUIRED:
          throw new BadRequestException(message);
        case ACTIVITIES_ERRORS.USER_NO_ORG:
        case ACTIVITIES_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case ACTIVITIES_ERRORS.LEAD_NOT_FOUND:
        case ACTIVITIES_ERRORS.DEAL_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in createActivity:', error);
          throw new InternalServerErrorException(ACTIVITIES_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerGetAllActivities()
  async getAllActivities(@CurrentUser() user: User) {
    try {
      const activities = await this.activitiesService.getAllActivities(
        user,
        user.role?.name || '',
      );

      return {
        message: ACTIVITIES_MESSAGES.ACTIVITIES_RETRIEVED,
        data: activities,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message === ACTIVITIES_ERRORS.USER_NO_ORG) {
        throw new ForbiddenException(message);
      }

      console.error('Error in getAllActivities:', error);
      throw new InternalServerErrorException(ACTIVITIES_ERRORS.UNEXPECTED_ERROR);
    }
  }
}
