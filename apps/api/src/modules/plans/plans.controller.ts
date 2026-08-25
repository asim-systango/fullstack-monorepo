import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
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
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlansService } from './plans.service';

@ApiTags('plans')
@Controller('plans')
@Roles('user')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a workout plan template' })
  @ApiCreatedResponse({ description: 'Created plan' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreatePlanDto) {
    return this.plansService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List own workout plans' })
  @ApiOkResponse({ description: 'Plans with their days' })
  findAll(@CurrentUser() user: JwtUser) {
    return this.plansService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one own workout plan' })
  @ApiOkResponse({ description: 'Plan with its days' })
  findOne(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own plan (title/notes, or replace all days)' })
  @ApiOkResponse({ description: 'Updated plan' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete own plan' })
  @ApiOkResponse({ description: 'Deletion acknowledged' })
  async remove(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.plansService.remove(user.id, id);
    return { id };
  }
}
