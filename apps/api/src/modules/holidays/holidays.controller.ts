import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { ListHolidaysQueryDto } from './dto/list-holidays-query.dto';
import { HolidaysService } from './holidays.service';

@ApiTags('holidays')
@ApiBearerAuth()
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidays: HolidaysService) {}

  @Get()
  @ApiOperation({ summary: 'Public holidays for a year (any signed-in user)' })
  list(@Query() query: ListHolidaysQueryDto) {
    return this.holidays.list(query.year);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Add a public holiday' })
  create(@Body() dto: CreateHolidayDto) {
    return this.holidays.create(dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove a public holiday' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.holidays.remove(id);
  }
}
