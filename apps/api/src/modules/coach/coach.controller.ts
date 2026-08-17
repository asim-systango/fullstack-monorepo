import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
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
import { ListWorkoutsDto } from '../workouts/dto/list-workouts.dto';
import { AssignAthleteDto } from './dto/assign-athlete.dto';
import { CoachService } from './coach.service';

@ApiTags('coach')
@Controller('coach')
@Roles('staff')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('athletes')
  @ApiOperation({ summary: 'List athletes assigned to this coach' })
  @ApiOkResponse({ description: 'Assigned athletes' })
  listAthletes(@CurrentUser() user: JwtUser) {
    return this.coachService.listAthletes(user.id);
  }

  @Get('athletes/:athleteId')
  @ApiOperation({ summary: 'Athlete details assigned to this coach' })
  @ApiOkResponse({ description: 'Assigned athletes details' })
  getAthletesDetails(@Param('athleteId', ParseUUIDPipe) athleteId: string) {
    return this.coachService.getAthletesDetails(athleteId);
  }

  @Get('athletes/:athleteId/workouts')
  @ApiOperation({ summary: "Read-only: an assigned athlete's workout history" })
  @ApiOkResponse({ description: 'Paginated workouts' })
  getAthleteWorkouts(
    @CurrentUser() user: JwtUser,
    @Param('athleteId', ParseUUIDPipe) athleteId: string,
    @Query() query: ListWorkoutsDto,
  ) {
    return this.coachService.getAthleteWorkouts(user.id, athleteId, query);
  }

  @Get('athletes/:athleteId/prs')
  @ApiOperation({ summary: "Read-only: an assigned athlete's personal records" })
  @ApiOkResponse({ description: 'Personal records' })
  getAthletePrs(
    @CurrentUser() user: JwtUser,
    @Param('athleteId', ParseUUIDPipe) athleteId: string,
  ) {
    return this.coachService.getAthletePrs(user.id, athleteId);
  }

  // —— Admin: coach↔athlete assignment management @Roles('admin')  ——

  @Get('assignments')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List every coach-athlete assignment' })
  @ApiOkResponse({ description: 'Coach-athlete assignments' })
  listAssignments() {
    return this.coachService.listAssignments();
  }

  @Get('assignments/coaches')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List coach (staff) users for the assignment picker' })
  @ApiOkResponse({ description: 'Staff users' })
  listCoachCandidates() {
    return this.coachService.listUsersByRole('staff');
  }

  @Get('assignments/athletes')
  @Roles('admin')
  @ApiOperation({
    summary: '[Admin] List athlete (user) users for the assignment picker',
  })
  @ApiOkResponse({ description: 'Athlete users' })
  listAthleteCandidates() {
    return this.coachService.listUsersByRole('user');
  }

  @Post('assignments')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Assign an athlete to a coach' })
  @ApiCreatedResponse({ description: 'Created assignment' })
  assign(@Body() dto: AssignAthleteDto) {
    return this.coachService.assignAthlete(dto.coachUserId, dto.athleteUserId);
  }

  @Delete('assignments/:id')
  @Roles('admin')
  @HttpCode(200)
  @ApiOperation({ summary: '[Admin] Remove a coach-athlete assignment' })
  @ApiOkResponse({ description: 'Deletion acknowledged' })
  async unassign(@Param('id', ParseUUIDPipe) id: string) {
    await this.coachService.unassignAthlete(id);
    return { id };
  }
}
