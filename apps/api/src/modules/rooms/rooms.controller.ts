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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CurrentUser, Public, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';

@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('hotels/:hotelId/rooms')
  @Public()
  findByHotel(@Param('hotelId', ParseUUIDPipe) hotelId: string) {
    return this.roomsService.findByHotel(hotelId);
  }

  @Post('hotels/:hotelId/rooms')
  @Roles('admin', 'staff')
  create(
    @Param('hotelId', ParseUUIDPipe) hotelId: string,
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.roomsService.create(hotelId, dto, user.id, user.role);
  }

  @Patch('rooms/:id')
  @Roles('admin', 'staff')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.roomsService.update(id, dto, user.id, user.role);
  }

  @Delete('rooms/:id')
  @Roles('admin', 'staff')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.roomsService.remove(id, user.id, user.role);
  }

  @Get('availability')
  @Public()
  findAvailable(@Query() query: AvailabilityQueryDto) {
    return this.roomsService.findAvailable(query);
  }
}
