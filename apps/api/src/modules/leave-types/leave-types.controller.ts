import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveTypesService } from './leave-types.service';

@ApiTags('leave-types')
@ApiBearerAuth()
@Controller('leave-types')
export class LeaveTypesController {
  constructor(private readonly leaveTypes: LeaveTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Active leave types (any signed-in user)' })
  list() {
    return this.leaveTypes.findActive();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a leave type' })
  create(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveTypes.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Edit a leave type' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.leaveTypes.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Archive a leave type (409 while it has pending requests)' })
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveTypes.archive(id);
  }
}
