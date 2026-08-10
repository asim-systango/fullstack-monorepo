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
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Public } from '../../common/auth';

@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all prescriptions' })
  @ApiQuery({ name: 'appointmentId', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of prescriptions returned successfully',
  })
  async findAll(@Query('appointmentId') appointmentId?: string) {
    if (appointmentId) {
      const res = await this.prescriptionService.findByAppointmentId(appointmentId);
      return res ? [res] : [];
    }
    return this.prescriptionService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiResponse({ status: 200, description: 'Prescription found' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  async create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update prescription details' })
  @ApiResponse({ status: 200, description: 'Prescription updated successfully' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prescription' })
  @ApiResponse({ status: 200, description: 'Prescription deleted' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionService.remove(id);
  }
}
