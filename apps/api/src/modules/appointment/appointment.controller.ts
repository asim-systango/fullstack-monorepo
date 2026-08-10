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
  @ApiOperation({ summary: 'List appointments with optional filters and pagination' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'status', enum: AppointmentStatus, required: false })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'ISO start date' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'ISO end date' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sort', required: false, enum: ['createdAt', 'startsAt'] })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of appointments returned successfully',
  })
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: 'createdAt' | 'startsAt',
  ) {
    return this.appointmentService.findAll({
      patientId,
      doctorId,
      status,
      dateFrom,
      dateTo,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Book a new consultation slot (Transactional & Lock Protected)',
  })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid slot or past date' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — Patient authentication required',
  })
  @ApiResponse({ status: 409, description: 'Conflict — Slot already booked or locked' })
  async create(
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto: CreateAppointmentDto,
  ) {
    const patientId = user?.id;
    if (!patientId) {
      throw new UnauthorizedException('Authentication required to book an appointment');
    }
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
  @ApiResponse({ status: 200, description: 'Appointment cancelled and slot freed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Patient can only cancel own appointments',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.appointmentService.remove(id, user?.id, user?.role);
  }
}
