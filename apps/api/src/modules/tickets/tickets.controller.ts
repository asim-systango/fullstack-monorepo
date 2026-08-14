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
  TicketFilterDto,
  CreateMessageDto,
  TicketResponseDto,
  TicketEventResponseDto,
  MessageResponseDto,
  PaginatedTicketsResponseDto,
} from './dto';

const TICKET_NOT_FOUND_DESC = 'Ticket not found';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({
    summary: 'List tickets with pagination, filters, FTS search & role scoping',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated tickets list retrieved successfully',
    type: PaginatedTicketsResponseDto,
  })
  async findAll(
    @Query() query: TicketFilterDto,
    @CurrentUser() user: JwtUser,
  ): Promise<PaginatedTicketsResponseDto> {
    const result = await this.ticketsService.findAll(query, user);
    return {
      items: result.items.map((ticket) => TicketResponseDto.fromEntity(ticket)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket detail by ID with customer ownership validation' })
  @ApiResponse({
    status: 200,
    description: 'Ticket detail retrieved successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: TICKET_NOT_FOUND_DESC })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.findOne(id, user);
    return TicketResponseDto.fromEntity(ticket);
  }

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
  @ApiResponse({ status: 404, description: TICKET_NOT_FOUND_DESC })
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
  @ApiResponse({ status: 404, description: TICKET_NOT_FOUND_DESC })
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
  @ApiResponse({ status: 404, description: TICKET_NOT_FOUND_DESC })
  async getEvents(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TicketEventResponseDto[]> {
    const events = await this.ticketsService.getTicketEvents(id);
    return events.map((event) => TicketEventResponseDto.fromEntity(event));
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get message thread for a ticket (Public for user, all for Staff)',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket messages thread retrieved successfully',
    type: [MessageResponseDto],
  })
  @ApiResponse({ status: 404, description: TICKET_NOT_FOUND_DESC })
  async getMessages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.ticketsService.getMessages(id, user);
    return messages.map((msg) => MessageResponseDto.fromEntity(msg));
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add reply or staff internal note to ticket thread' })
  @ApiResponse({
    status: 201,
    description: 'Message added successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot reply to closed ticket or invalid payload',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (Non-staff internal note attempt)',
  })
  @ApiResponse({ status: 404, description: TICKET_NOT_FOUND_DESC })
  async createMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.ticketsService.createMessage(id, user, dto);
    return MessageResponseDto.fromEntity(message);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a ticket with audit tracking (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Ticket soft-deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden (Non-admin)' })
  @ApiResponse({ status: 404, description: TICKET_NOT_FOUND_DESC })
  async softDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<{ id: string; deletedAt: Date; deletedBy: string }> {
    return this.ticketsService.softDelete(id, user);
  }
}
