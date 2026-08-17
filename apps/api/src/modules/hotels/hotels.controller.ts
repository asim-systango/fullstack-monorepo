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
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelQueryDto } from './dto/hotel-query.dto';
import { CurrentUser, Public, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @Public()
  findAll(@Query() query: HotelQueryDto) {
    return this.hotelsService.findAll({ ...query, withDeleted: false });
  }

  @Get('manage')
  @Roles('admin', 'staff')
  findAllManage(@Query() query: HotelQueryDto) {
    return this.hotelsService.findAll({ ...query, withDeleted: true });
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'staff')
  create(@Body() dto: CreateHotelDto, @CurrentUser() user: JwtUser) {
    return this.hotelsService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles('admin', 'staff')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotelDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.hotelsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @Roles('admin', 'staff')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.hotelsService.softDelete(id, user.id, user.role);
  }
}
