import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, Roles } from '../../common/auth';
import { BookCopiesService } from './book-copies.service';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';

@ApiTags('book-copies')
@Controller('books/:bookId/copies')
export class BookCopiesController {
  constructor(private readonly copiesService: BookCopiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List copies for a book' })
  list(@Param('bookId') bookId: string) {
    return this.copiesService.listByBook(bookId);
  }

  @Roles('staff', 'admin')
  @Post()
  @ApiOperation({ summary: 'Add a copy (librarian)' })
  create(@Param('bookId') bookId: string, @Body() dto: CreateBookCopyDto) {
    return this.copiesService.create(bookId, dto);
  }

  @Roles('staff', 'admin')
  @Patch(':copyId')
  @ApiOperation({ summary: 'Update a copy (librarian)' })
  update(
    @Param('bookId') bookId: string,
    @Param('copyId') copyId: string,
    @Body() dto: UpdateBookCopyDto,
  ) {
    return this.copiesService.update(bookId, copyId, dto);
  }

  @Roles('staff', 'admin')
  @Delete(':copyId')
  @ApiOperation({ summary: 'Soft-delete a copy (librarian)' })
  softDelete(@Param('bookId') bookId: string, @Param('copyId') copyId: string) {
    return this.copiesService.softDelete(bookId, copyId);
  }
}
