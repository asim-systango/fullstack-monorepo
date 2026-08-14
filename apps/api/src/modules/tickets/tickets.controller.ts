import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, Roles, JwtUser } from '../../common/auth';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  AssignTicketDto,
  UpdateStatusDto,
  TicketResponseDto,
  TicketEventResponseDto,
} from './dto';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new support ticket with initial message (User)' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid category or input payload' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.create(user.id, dto);
    return TicketResponseDto.fromEntity(ticket);
  }

  @Patch(':id/assign')
  @Roles('staff', 'admin')
  @ApiOperation({
    summary: 'Reassign ticket to staff member with optimistic locking (Staff/Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket reassigned successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({
    status: 409,
    description: 'Concurrent modification conflict (version mismatch)',
  })
  async assign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: AssignTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.assign(id, user.id, dto);
    return TicketResponseDto.fromEntity(ticket);
  }

  @Patch(':id/status')
  @Roles('staff', 'admin')
  @ApiOperation({
    summary:
      'Update ticket status using status machine with optimistic locking (Staff/Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({
    status: 409,
    description: 'Concurrent modification conflict (version mismatch)',
  })
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateStatusDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.updateStatus(id, user.id, dto);
    return TicketResponseDto.fromEntity(ticket);
  }

  @Get(':id/events')
  @Roles('staff', 'admin')
  @ApiOperation({ summary: 'Get audit history trail for a ticket (Staff/Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Ticket events retrieved successfully',
    type: [TicketEventResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getEvents(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TicketEventResponseDto[]> {
    const events = await this.ticketsService.getTicketEvents(id);
    return events.map((event) => TicketEventResponseDto.fromEntity(event));
  }
}
