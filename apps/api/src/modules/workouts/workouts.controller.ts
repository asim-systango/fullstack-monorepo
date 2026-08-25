import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { ListWorkoutsDto } from './dto/list-workouts.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutsService } from './workouts.service';

@ApiTags('workouts')
@Controller('workouts')
@Roles('user')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  @ApiOperation({
    summary: 'Log a workout',
    description:
      'Creates the workout, exercise logs, and sets in one transaction, and updates ' +
      'personal records for any set that beats the prior best (envelope `{ data }`).',
  })
  @ApiCreatedResponse({ description: 'Created workout' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateWorkoutDto) {
    return this.workoutsService.create(user.id, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List own workout history',
    description:
      'Paginated, filterable by dateFrom/dateTo/exercise; excludes soft-deleted rows.',
  })
  @ApiOkResponse({ description: 'Paginated workouts' })
  findAll(@CurrentUser() user: JwtUser, @Query() query: ListWorkoutsDto) {
    return this.workoutsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one own workout with exercise logs and sets' })
  @ApiOkResponse({ description: 'Workout with exercise logs and sets' })
  findOne(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.workoutsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Update own workout's title/date, or replace its exercises/sets",
    description:
      'When `exercises` is provided, replaces the entire exercise/set tree in one ' +
      'transaction and recomputes personal records for every exercise affected.',
  })
  @ApiOkResponse({ description: 'Updated workout' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft-delete own workout' })
  @ApiOkResponse({ description: 'Deletion acknowledged' })
  async remove(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.workoutsService.softDelete(user.id, id);
    return { id };
  }
}
