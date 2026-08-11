import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Public } from '../../common/auth';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { BookCopyStatus } from '../books/enums/book-copy-status.enum';

export class PublicDashboardDto {
  @ApiProperty({ description: 'Non-deleted book titles' })
  totalTitles!: number;

  @ApiProperty({ description: 'Copies with status available (non-deleted)' })
  availableCopies!: number;
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
  ) {}

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Public landing stats',
    description: 'Total titles and available copies — no private counts.',
  })
  @ApiOkResponse({ type: PublicDashboardDto })
  async publicStats(): Promise<PublicDashboardDto> {
    const [totalTitles, availableCopies] = await Promise.all([
      this.books.count({ where: { deletedAt: IsNull() } }),
      this.copies.count({
        where: { status: BookCopyStatus.Available, deletedAt: IsNull() },
      }),
    ]);
    return { totalTitles, availableCopies };
  }
}
