import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';
import {
  BookDetailResponseDto,
  BookResponseDto,
  PaginatedBooksResponseDto,
} from './dto/book-response.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksQueryDto } from './dto/list-books-query.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksService } from './books.service';
import { BookActionsService } from './book-actions.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List books (public catalog)',
    description:
      'Returns non-deleted books with pagination. Supports q (title/ISBN), author, isbn, availableOnly, and sort.',
  })
  @ApiOkResponse({
    description:
      'Paginated catalog (envelope: `{ data: { items, total, page, limit } }`)',
    type: PaginatedBooksResponseDto,
  })
  list(@Query() query: ListBooksQueryDto) {
    return this.booksService.list(query);
  }

  @Roles('staff', 'admin')
  @Get('deleted')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List soft-deleted books (librarian)',
    description: 'Staff/admin only. Soft-deleted titles for restore workflows.',
  })
  @ApiOkResponse({ type: PaginatedBooksResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer JWT' })
  @ApiForbiddenResponse({ description: 'Requires staff or admin role' })
  listDeleted(@Query() query: ListBooksQueryDto) {
    return this.booksService.listDeleted(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get book by id with copy counts',
    description:
      'Public detail view including totalCopies, availableCopies, and onLoanCopies. Soft-deleted books return 404.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: BookDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Book missing or soft-deleted' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  @Roles('staff', 'admin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create book (librarian)' })
  @ApiCreatedResponse({ type: BookResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(@Body() dto: CreateBookDto, @CurrentUser() user: JwtUser) {
    return this.booksService.create(dto, user.id);
  }

  @Roles('staff', 'admin')
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update book (librarian)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: BookResponseDto })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Roles('staff', 'admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete book (librarian)',
    description:
      'Hides the book from the public catalog. Returns 409 if any non-deleted copy is on_loan. Does not delete loan history.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Soft-deleted' })
  @ApiConflictResponse({ description: 'One or more copies are currently on loan' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.softDelete(id);
  }

  @Roles('staff', 'admin')
  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore soft-deleted book (librarian)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: BookResponseDto })
  @ApiNotFoundResponse({ description: 'Book is not soft-deleted or does not exist' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.restore(id);
  }
}

@ApiTags('books')
@ApiBearerAuth()
@Controller('my/books')
export class MyBookActionsController {
  constructor(private readonly bookActions: BookActionsService) {}

  @Roles('user')
  @Get(':id/actions')
  @ApiOperation({
    summary: 'Authenticated member actions for a catalog title',
    description:
      'Additive to public GET /books/:id. Returns borrow-limit, own loan/reservation/request, and CTA flags.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  getMine(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookActions.getMine(user.id, id);
  }
}
