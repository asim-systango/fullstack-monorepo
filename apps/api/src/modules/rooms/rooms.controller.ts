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
import { Public, Roles } from '../../common/auth';

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
  create(@Param('hotelId', ParseUUIDPipe) hotelId: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(hotelId, dto);
  }

  @Patch('rooms/:id')
  @Roles('admin', 'staff')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @Delete('rooms/:id')
  @Roles('admin', 'staff')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.remove(id);
  }

  @Get('availability')
  @Public()
  findAvailable(@Query() query: AvailabilityQueryDto) {
    return this.roomsService.findAvailable(query);
  }
}
