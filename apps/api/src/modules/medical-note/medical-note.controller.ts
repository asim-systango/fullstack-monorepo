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
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { MedicalNoteService } from './medical-note.service';
import { CreateMedicalNoteDto } from './dto/create-medical-note.dto';
import { UpdateMedicalNoteDto } from './dto/update-medical-note.dto';
import { CurrentUser, JwtUser, Roles } from '../../common/auth';

@ApiTags('Medical Notes')
@Controller()
export class MedicalNoteController {
  constructor(private readonly medicalNoteService: MedicalNoteService) {}

  @Get('medical-notes')
  @ApiOperation({ summary: 'List clinical medical notes (Doctor & Admin only)' })
  @ApiQuery({ name: 'appointmentId', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of medical notes returned successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Patients cannot access internal medical notes',
  })
  async findAll(
    @CurrentUser() user: JwtUser | undefined,
    @Query('appointmentId') appointmentId?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    if (user?.role === 'PATIENT') {
      throw new ForbiddenException('Patients cannot access internal clinical notes');
    }
    return this.medicalNoteService.findAll({ appointmentId, doctorId });
  }

  @Get('patients/me/medical-notes')
  @Roles('PATIENT')
  @ApiOperation({ summary: 'Get patient-visible consultation notes history' })
  @ApiResponse({ status: 200, description: 'Patient note history' })
  async getPatientHistory(@CurrentUser() user: JwtUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.medicalNoteService.findPatientHistory(user);
  }

  @Get('appointments/:appointmentId/medical-notes')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get clinical notes for a specific appointment' })
  @ApiResponse({ status: 200, description: 'Medical notes for appointment' })
  @ApiResponse({ status: 403, description: 'Forbidden — Doctor or Admin role required' })
  async findByAppointmentId(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.medicalNoteService.findByAppointmentId(appointmentId, user);
  }

  @Post('appointments/:appointmentId/medical-notes')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Record clinical medical note for an appointment' })
  @ApiResponse({ status: 201, description: 'Medical note recorded successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Doctor or Admin role required' })
  async createForAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto: CreateMedicalNoteDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required to record medical note');
    }
    return this.medicalNoteService.createForAppointment(appointmentId, dto, user);
  }

  @Get('medical-notes/:id')
  @ApiOperation({ summary: 'Get medical note by ID (Doctor & Admin only)' })
  @ApiResponse({ status: 200, description: 'Medical note found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — Patients cannot access internal medical notes',
  })
  @ApiResponse({ status: 404, description: 'Medical note not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.medicalNoteService.findOne(id, user);
  }

  @Patch('medical-notes/:id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Update medical note content' })
  @ApiResponse({ status: 200, description: 'Medical note updated successfully' })
  @ApiResponse({ status: 404, description: 'Medical note not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto: UpdateMedicalNoteDto,
  ) {
    return this.medicalNoteService.update(id, dto, user);
  }

  @Delete('medical-notes/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a medical note' })
  @ApiResponse({ status: 200, description: 'Medical note deleted' })
  @ApiResponse({ status: 404, description: 'Medical note not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalNoteService.remove(id);
  }
}
