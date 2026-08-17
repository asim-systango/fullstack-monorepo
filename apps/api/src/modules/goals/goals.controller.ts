import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalsService } from './goals.service';

@ApiTags('goals')
@Controller('goals')
@Roles('user')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a goal for an exercise' })
  @ApiCreatedResponse({ description: 'Created goal, with progress against current PR' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List own goals with progress' })
  @ApiOkResponse({ description: 'Goals, each with currentBestWeightKg/progressPercent' })
  findAll(@CurrentUser() user: JwtUser) {
    return this.goalsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one own goal with progress' })
  @ApiOkResponse({ description: 'Goal with progress' })
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.goalsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own goal' })
  @ApiOkResponse({ description: 'Updated goal with progress' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete own goal' })
  @ApiOkResponse({ description: 'Deletion acknowledged' })
  async remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    await this.goalsService.remove(user.id, id);
    return { id };
  }
}
