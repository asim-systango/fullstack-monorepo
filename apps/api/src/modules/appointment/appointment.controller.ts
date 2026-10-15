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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';
import { CurrentUser, JwtUser, Roles } from '../../common/auth';

const APPOINTMENT_NOT_FOUND_MSG = 'Appointment not found';

@ApiTags('Appointments')
@Controller()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('appointments')
  @ApiOperation({
    summary: 'List appointments with role scoping and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of appointments returned successfully',
  })
  async findAll(
    @CurrentUser() user: JwtUser | undefined,
    @Query() query: GetAppointmentsQueryDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required to access appointments');
    }
    return this.appointmentService.findAll(user, query);
  }

  @Get('admin/appointments')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Admin-only hospital-wide appointment search and filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospital-wide appointments list with metadata',
  })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  async findAdminAppointments(
    @CurrentUser() user: JwtUser | undefined,
    @Query() query: GetAppointmentsQueryDto,
  ) {
    return this.appointmentService.findAdminAppointments(user, query);
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Get appointment details by ID (Role Scoped)' })
  @ApiResponse({ status: 200, description: 'Appointment details found' })
  @ApiResponse({ status: 403, description: 'Forbidden — Access denied' })
  @ApiResponse({ status: 404, description: APPOINTMENT_NOT_FOUND_MSG })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required to view appointment details',
      );
    }
    return this.appointmentService.findOne(id, user);
  }

  @Post('appointments')
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

  @Post('appointments/:id/complete')
  @ApiOperation({
    summary: 'Complete appointment, issue prescription and record clinical note (POST)',
  })
  @ApiResponse({ status: 200, description: 'Appointment marked completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or already completed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Only assigned Doctor or Admin can complete',
  })
  @ApiResponse({ status: 404, description: APPOINTMENT_NOT_FOUND_MSG })
  async completePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto?: CompleteAppointmentDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required to complete appointment');
    }
    return this.appointmentService.complete(id, user, dto);
  }

  @Patch('appointments/:id/complete')
  @ApiOperation({
    summary: 'Complete appointment, issue prescription and record clinical note (PATCH)',
  })
  @ApiResponse({ status: 200, description: 'Appointment marked completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or already completed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Only assigned Doctor or Admin can complete',
  })
  @ApiResponse({ status: 404, description: APPOINTMENT_NOT_FOUND_MSG })
  async completePatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto?: CompleteAppointmentDto,
  ) {
    return this.completePost(id, user, dto);
  }

  @Patch('appointments/:id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update appointment status or reason (Doctor/Admin scoped)' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Admin or assigned Doctor required',
  })
  @ApiResponse({ status: 404, description: APPOINTMENT_NOT_FOUND_MSG })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required to update appointment');
    }
    return this.appointmentService.update(id, dto, user);
  }

  @Delete('appointments/:id')
  @ApiOperation({ summary: 'Cancel and soft-delete an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled and slot freed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Patient can only cancel own appointments',
  })
  @ApiResponse({ status: 404, description: APPOINTMENT_NOT_FOUND_MSG })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.appointmentService.remove(id, user?.id, user?.role);
  }
}
