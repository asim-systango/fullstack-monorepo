import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { CurrentUser } from '../../common/auth';
import type { JwtUser } from '../../common/auth';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@Query() query: BookingQueryDto, @CurrentUser() user: JwtUser) {
    return this.bookingsService.findAll(query, user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.bookingsService.findOneForUser(id, user.id, user.role);
  }

  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: JwtUser) {
    return this.bookingsService.create(dto, user.id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.bookingsService.cancel(id, user.id, user.role);
  }
}
