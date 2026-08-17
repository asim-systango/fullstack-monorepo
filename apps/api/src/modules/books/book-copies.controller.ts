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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { BookCopiesService } from './book-copies.service';
import { BookCopyResponseDto } from './dto/book-response.dto';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { ListBookCopiesQueryDto } from './dto/list-book-copies-query.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';

@ApiTags('book-copies')
@ApiBearerAuth()
@Controller('books/:bookId/copies')
export class BookCopiesController {
  constructor(private readonly copiesService: BookCopiesService) {}

  @Roles('staff', 'admin')
  @Get()
  @ApiOperation({
    summary: 'List copies for a book (librarian)',
    description: 'Returns non-deleted physical copies for an active catalog title.',
  })
  @ApiParam({ name: 'bookId', format: 'uuid' })
  @ApiOkResponse({ type: [BookCopyResponseDto] })
  @ApiNotFoundResponse({ description: 'Book missing or soft-deleted' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  list(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Query() query: ListBookCopiesQueryDto,
  ) {
    return this.copiesService.listByBook(bookId, query.status);
  }

  @Roles('staff', 'admin')
  @Post()
  @ApiOperation({
    summary: 'Add a copy (librarian)',
    description: 'New copies start as `available`. Duplicate barcode returns 409.',
  })
  @ApiParam({ name: 'bookId', format: 'uuid' })
  @ApiCreatedResponse({ type: BookCopyResponseDto })
  @ApiConflictResponse({ description: 'Barcode already exists' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  create(@Param('bookId', ParseUUIDPipe) bookId: string, @Body() dto: CreateBookCopyDto) {
    return this.copiesService.create(bookId, dto);
  }
}

@ApiTags('book-copies')
@ApiBearerAuth()
@Controller('copies')
export class CopiesController {
  constructor(private readonly copiesService: BookCopiesService) {}

  @Roles('staff', 'admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a copy (librarian)',
    description:
      'Allowed status transitions: available → lost, lost → available. Cannot set or change from on_loan here (loans module owns that).',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Copy id' })
  @ApiOkResponse({ type: BookCopyResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  @ApiConflictResponse({ description: 'Barcode already exists' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBookCopyDto) {
    return this.copiesService.update(id, dto);
  }

  @Roles('staff', 'admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft-delete a copy (librarian)',
    description: 'Returns 409 if the copy is currently on_loan.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Copy id' })
  @ApiNoContentResponse({ description: 'Soft-deleted' })
  @ApiConflictResponse({ description: 'Copy is on loan' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.copiesService.softDelete(id);
  }
}
