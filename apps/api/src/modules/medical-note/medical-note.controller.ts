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
import { MedicalNoteService } from './medical-note.service';
import { CreateMedicalNoteDto } from './dto/create-medical-note.dto';
import { UpdateMedicalNoteDto } from './dto/update-medical-note.dto';
import { Public } from '../../common/auth';

@ApiTags('Medical Notes')
@Controller('medical-notes')
export class MedicalNoteController {
  constructor(private readonly medicalNoteService: MedicalNoteService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List medical notes with filters' })
  @ApiQuery({ name: 'appointmentId', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of medical notes returned successfully',
  })
  async findAll(
    @Query('appointmentId') appointmentId?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.medicalNoteService.findAll({ appointmentId, doctorId });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get medical note by ID' })
  @ApiResponse({ status: 200, description: 'Medical note found' })
  @ApiResponse({ status: 404, description: 'Medical note not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalNoteService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a clinical medical note' })
  @ApiResponse({ status: 201, description: 'Medical note created successfully' })
  async create(@Body() dto: CreateMedicalNoteDto) {
    return this.medicalNoteService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medical note content' })
  @ApiResponse({ status: 200, description: 'Medical note updated successfully' })
  @ApiResponse({ status: 404, description: 'Medical note not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicalNoteDto,
  ) {
    return this.medicalNoteService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medical note' })
  @ApiResponse({ status: 200, description: 'Medical note deleted' })
  @ApiResponse({ status: 404, description: 'Medical note not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalNoteService.remove(id);
  }
}
