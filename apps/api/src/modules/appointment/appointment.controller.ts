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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { CurrentUser, Public, JwtUser } from '../../common/auth';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all appointments with optional filters' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'status', enum: AppointmentStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of appointments returned successfully' })
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.appointmentService.findAll({ patientId, doctorId, status });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Book a new appointment for a slot' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  async create(
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto: CreateAppointmentDto,
  ) {
    // If authenticated user is present, use user.id as patientId, otherwise fallback for mock/dev
    const patientId = user?.id ?? '00000000-0000-0000-0000-000000000001';
    return this.appointmentService.create(patientId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment status or reason' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel and soft-delete an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.remove(id);
  }
}
