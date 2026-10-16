import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('admin', 'staff')
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.eventsService.create(createEventDto, user.id);
  }

  @Get()
  @Public()
  async findAll(
    @Query() queryDto: QueryEventsDto,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.eventsService.findAll(queryDto, user);
  }

  @Get('organizer/my-events')
  @Roles('admin', 'staff')
  async findMyOrganizedEvents(
    @Query() queryDto: QueryEventsDto,
    @CurrentUser() user: JwtUser,
  ) {
    const targetOrganizerId = user.role === 'admin' ? queryDto.organizerId : user.id;
    return this.eventsService.findAll({
      ...queryDto,
      organizerId: targetOrganizerId,
      includeAllStatuses: true,
      includeDeleted: user.role === 'admin' || Boolean(queryDto.includeDeleted),
    });
  }

  @Get(':id')
  @Public()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.eventsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'staff')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.eventsService.update(id, updateEventDto, user.id, user.role);
  }

  @Patch(':id/publish')
  @Roles('admin', 'staff')
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.eventsService.publish(id, user.id, user.role);
  }

  @Patch(':id/cancel')
  @Roles('admin', 'staff')
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.eventsService.cancel(id, user.id, user.role);
  }

  @Delete(':id')
  @Roles('admin', 'staff')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.eventsService.remove(id, user.id, user.role);
  }

  @Get(':id/analytics')
  @Roles('admin', 'staff')
  async getAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.eventsService.getAnalytics(id, user.id, user.role);
  }
}
