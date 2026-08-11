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
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CurrentUser, JwtUser, Roles } from '../../common/auth';

@ApiTags('Prescriptions')
@Controller()
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Get('prescriptions')
  @ApiOperation({ summary: 'List all prescriptions' })
  @ApiQuery({ name: 'appointmentId', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of prescriptions returned successfully',
  })
  async findAll(
    @CurrentUser() user: JwtUser | undefined,
    @Query('appointmentId') appointmentId?: string,
  ) {
    if (appointmentId) {
      const res = await this.prescriptionService.findByAppointmentId(appointmentId, user);
      return res ? [res] : [];
    }
    return this.prescriptionService.findAll();
  }

  @Get('appointments/:appointmentId/prescription')
  @ApiOperation({ summary: 'Get prescription for a specific appointment' })
  @ApiResponse({ status: 200, description: 'Prescription found' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findByAppointmentId(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    const prescription = await this.prescriptionService.findByAppointmentId(
      appointmentId,
      user,
    );
    if (!prescription) {
      return { success: true, data: null };
    }
    return prescription;
  }

  @Post('appointments/:appointmentId/prescriptions')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create a prescription for a completed appointment' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  @ApiResponse({ status: 400, description: 'Appointment is not completed' })
  @ApiResponse({ status: 403, description: 'Forbidden — Doctor or Admin role required' })
  @ApiResponse({ status: 409, description: 'Conflict — Prescription already exists' })
  async createForAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto: CreatePrescriptionDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required to create prescription');
    }
    return this.prescriptionService.createForAppointment(appointmentId, dto, user);
  }

  @Get('prescriptions/:id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiResponse({ status: 200, description: 'Prescription found' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.prescriptionService.findOne(id, user);
  }

  @Patch('prescriptions/:id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Update prescription details' })
  @ApiResponse({ status: 200, description: 'Prescription updated successfully' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, dto, user);
  }

  @Delete('prescriptions/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a prescription' })
  @ApiResponse({ status: 200, description: 'Prescription deleted' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionService.remove(id);
  }
}
