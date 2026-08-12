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
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { CurrentUser, JwtUser, Public, Roles } from '../../common/auth';

import { SlotService } from '../slot/slot.service';

const NOT_FOUND_DESC = 'Doctor profile not found';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly slotService: SlotService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all doctors (with optional filters)' })
  @ApiQuery({ name: 'specialization', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'approvalStatus', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of doctor profiles returned successfully',
  })
  async findAll(
    @Query('specialization') specialization?: string,
    @Query('search') search?: string,
    @Query('approvalStatus') approvalStatus?: string,
    @Query('isActive') isActiveStr?: string,
  ) {
    const isActive = isActiveStr !== undefined ? isActiveStr === 'true' : undefined;
    return this.doctorService.findAll({
      specialization,
      search,
      approvalStatus,
      isActive,
    });
  }

  @Get('me')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get doctor profile of current logged-in user' })
  @ApiResponse({ status: 200, description: 'Current doctor profile returned' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESC })
  async findMe(@CurrentUser() user: JwtUser | undefined) {
    if (!user) {
      throw new NotFoundException('Authentication required');
    }
    const doctor = await this.doctorService.findByUserId(user.id);
    if (!doctor) {
      throw new NotFoundException(`Doctor profile not found for user ID "${user.id}"`);
    }
    return doctor;
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get doctor profile by ID' })
  @ApiResponse({ status: 200, description: 'Doctor profile found' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESC })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.findOne(id);
  }

  @Public()
  @Get(':id/slots')
  @ApiOperation({ summary: 'Get available future consultation slots for doctor' })
  @ApiResponse({ status: 200, description: 'List of available slots' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESC })
  async findDoctorSlots(@Param('id', ParseUUIDPipe) id: string) {
    await this.doctorService.findOne(id);
    return this.slotService.findAvailableForDoctor(id);
  }

  @Post()
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create a new doctor profile' })
  @ApiResponse({ status: 201, description: 'Doctor profile created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  async create(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update doctor profile details' })
  @ApiResponse({ status: 200, description: 'Doctor profile updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin or Doctor role required' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESC })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate doctor profile (soft-delete)' })
  @ApiResponse({ status: 200, description: 'Doctor profile deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESC })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.remove(id);
  }
}
