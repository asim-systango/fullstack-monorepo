import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('staff', 'admin', 'user')
  @Get()
  @ApiOperation({ summary: 'List reservations' })
  list(@Query() query: ListReservationsQueryDto) {
    return this.reservationsService.list(query);
  }

  @Roles('user')
  @Post()
  @ApiOperation({ summary: 'Create reservation (member)' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(user.id, dto);
  }

  @Roles('user', 'staff', 'admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel reservation' })
  cancel(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.reservationsService.cancel(id, user.id);
  }
}
