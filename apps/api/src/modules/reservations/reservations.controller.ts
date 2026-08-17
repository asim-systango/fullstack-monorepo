import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('staff', 'admin')
  @Get()
  @ApiOperation({ summary: 'List all reservations (staff/admin)' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  list(@Query() query: ListReservationsQueryDto) {
    return this.reservationsService.list(query);
  }

  @Roles('user')
  @Post()
  @ApiOperation({ summary: 'Create reservation (member)' })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(user.id, dto);
  }

  @Roles('user')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel own reservation' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  cancel(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.cancel(id, user.id);
  }
}

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('my/reservations')
export class MyReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('user')
  @Get()
  @ApiOperation({ summary: 'Authenticated member own reservations' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  listMine(@CurrentUser() user: JwtUser, @Query() query: ListReservationsQueryDto) {
    return this.reservationsService.listMine(user.id, query);
  }
}

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('books/:bookId/reservations')
export class BookReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('staff')
  @Get()
  @ApiOperation({ summary: 'Live FIFO reservation queue for a title' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  listByBook(@Param('bookId', ParseUUIDPipe) bookId: string) {
    return this.reservationsService.listByBook(bookId);
  }
}
