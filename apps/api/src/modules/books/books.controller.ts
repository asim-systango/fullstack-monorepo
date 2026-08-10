import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, Roles } from '../../common/auth';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksQueryDto } from './dto/list-books-query.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksService } from './books.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List books (paginated + filters)' })
  list(@Query() query: ListBooksQueryDto) {
    return this.booksService.list(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get book by id' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Roles('staff', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create book (librarian)' })
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Roles('staff', 'admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update book (librarian)' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Roles('staff', 'admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete book (librarian)' })
  softDelete(@Param('id') id: string) {
    return this.booksService.softDelete(id);
  }
}
