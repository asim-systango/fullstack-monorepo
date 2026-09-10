import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RsvpsService } from './rsvps.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { CurrentUser, type JwtUser } from '../../common/auth';

@Controller()
export class RsvpsController {
  constructor(private readonly rsvpsService: RsvpsService) {}

  @Post('events/:id/rsvp')
  async handleRsvp(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateRsvpDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.rsvpsService.handleRsvp(eventId, user.id, dto);
  }

  @Get('events/:id/rsvp/my')
  async getMyRsvpForEvent(
    @Param('id', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.rsvpsService.getMyRsvpForEvent(eventId, user.id);
  }

  @Get('my-rsvps')
  async getMyRsvps(@CurrentUser() user: JwtUser) {
    return this.rsvpsService.getMyRsvps(user.id);
  }

  @Get('my-waitlist')
  async getMyWaitlistEntries(@CurrentUser() user: JwtUser) {
    return this.rsvpsService.getMyWaitlistEntries(user.id);
  }
}
