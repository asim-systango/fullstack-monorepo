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
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Public } from '../../common/auth';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all doctor profiles with optional filters' })
  @ApiQuery({ name: 'specialization', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of doctor profiles returned successfully',
  })
  async findAll(
    @Query('specialization') specialization?: string,
    @Query('search') search?: string,
  ) {
    return this.doctorService.findAll({ specialization, search, isActive: true });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get doctor profile by ID' })
  @ApiResponse({ status: 200, description: 'Doctor profile found' })
  @ApiResponse({ status: 404, description: 'Doctor profile not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new doctor profile' })
  @ApiResponse({ status: 201, description: 'Doctor profile created successfully' })
  async create(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update doctor profile details' })
  @ApiResponse({ status: 200, description: 'Doctor profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Doctor profile not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile soft-deleted' })
  @ApiResponse({ status: 404, description: 'Doctor profile not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.remove(id);
  }
}
