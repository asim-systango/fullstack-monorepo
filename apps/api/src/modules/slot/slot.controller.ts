import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SlotService } from './slot.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { SlotStatus } from '../../shared/enums/slot-status.enum';
import { Public } from '../../common/auth';

@ApiTags('Slots')
@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List consultation slots with filters' })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'status', enum: SlotStatus, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'List of slots returned successfully' })
  async findAll(
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: SlotStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.slotService.findAll({ doctorId, status, startDate, endDate });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get slot by ID' })
  @ApiResponse({ status: 200, description: 'Slot found' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.slotService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a consultation slot' })
  @ApiResponse({ status: 201, description: 'Slot created successfully' })
  async create(@Body() dto: CreateSlotDto) {
    return this.slotService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update slot status' })
  @ApiResponse({ status: 200, description: 'Slot status updated' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSlotDto) {
    return this.slotService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a consultation slot' })
  @ApiResponse({ status: 200, description: 'Slot deleted' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.slotService.remove(id);
  }
}
