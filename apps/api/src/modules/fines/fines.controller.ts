import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { ListFinesQueryDto } from './dto/list-fines-query.dto';
import { FinesService } from './fines.service';

@ApiTags('fines')
@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Roles('staff', 'admin', 'user')
  @Get()
  @ApiOperation({ summary: 'List fines' })
  list(@Query() query: ListFinesQueryDto) {
    return this.finesService.list(query);
  }

  @Roles('staff', 'admin')
  @Post(':id/pay')
  @ApiOperation({ summary: 'Mark fine paid (librarian)' })
  markPaid(@Param('id') id: string) {
    return this.finesService.markPaid(id);
  }
}
