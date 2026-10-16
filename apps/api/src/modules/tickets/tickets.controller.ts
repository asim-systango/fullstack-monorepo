import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CheckInDto } from './dto/check-in.dto';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async getMyTickets(@CurrentUser() user: JwtUser) {
    return this.ticketsService.getMyTickets(user.id);
  }

  @Get(':id')
  async getTicketById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ticketsService.getTicketById(id, user.id, user.role);
  }

  @Post('check-in')
  @Roles('admin', 'staff')
  async checkInTicket(
    @Body() dto: CheckInDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ticketsService.checkInTicket(dto, user.id);
  }
}
