import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';
import { PersonalRecordsService } from './personal-records.service';

@ApiTags('personal-records')
@Controller('prs')
@Roles('user')
export class PersonalRecordsController {
  constructor(private readonly personalRecordsService: PersonalRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'List own personal records, one row per exercise' })
  @ApiOkResponse({ description: 'Personal records' })
  findAll(@CurrentUser() user: JwtUser) {
    return this.personalRecordsService.findAllExerciseForUser(user.id);
  }
}
