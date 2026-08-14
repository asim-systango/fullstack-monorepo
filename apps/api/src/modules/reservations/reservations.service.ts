import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { BookCopyStatus } from '../books/enums/book-copy-status.enum';
import { Loan } from '../loans/loan.entity';
import { MembersService } from '../members/members.service';
import type { CreateReservationDto } from './dto/create-reservation.dto';
import type { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { ReservationStatus } from './enums/reservation-status.enum';
import { Reservation } from './reservation.entity';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
    private readonly members: MembersService,
    private readonly dataSource: DataSource,
  ) {}

  async list(query: ListReservationsQueryDto): Promise<{
    items: Reservation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.reservations
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.book', 'book');

    if (query.userId) {
      qb.andWhere('r.user_id = :userId', { userId: query.userId });
    }
    if (query.bookId) {
      qb.andWhere('r.book_id = :bookId', { bookId: query.bookId });
    }
    if (query.status) {
      qb.andWhere('r.status = :status', { status: query.status });
    }

    qb.orderBy('r.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  listMine(userId: string, query: ListReservationsQueryDto) {
    return this.list({ ...query, userId });
  }

  async listByBook(bookId: string): Promise<Reservation[]> {
    const book = await this.books.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.reservations.find({
      where: { bookId, status: ReservationStatus.Active },
      order: { createdAt: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateReservationDto): Promise<Reservation> {
    await this.members.requireActiveMember(userId);

    const book = await this.books.findOne({ where: { id: dto.bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const availableCount = await this.copies.count({
      where: {
        bookId: dto.bookId,
        status: BookCopyStatus.Available,
        deletedAt: IsNull(),
      },
    });
    if (availableCount > 0) {
      throw new BadRequestException('Copies are available — reservation is not needed');
    }

    const activeLoan = await this.loans.findOne({
      where: {
        userId,
        bookId: dto.bookId,
        returnedAt: IsNull(),
      },
    });
    if (activeLoan) {
      throw new BadRequestException('You already have this title on active loan');
    }

    const position =
      (await this.reservations.count({
        where: { bookId: dto.bookId, status: ReservationStatus.Active },
      })) + 1;

    try {
      return await this.reservations.save(
        this.reservations.create({
          userId,
          bookId: dto.bookId,
          status: ReservationStatus.Active,
          queuePosition: position,
        }),
      );
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(
          'You already have an active reservation for this title',
        );
      }
      throw err;
    }
  }

  async cancel(id: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = await queryRunner.manager
        .getRepository(Reservation)
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.id = :id', { id })
        .getOne();

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }
      if (reservation.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own reservation');
      }
      if (reservation.status !== ReservationStatus.Active) {
        throw new BadRequestException('Reservation is not active');
      }

      reservation.status = ReservationStatus.Cancelled;
      reservation.cancelledAt = new Date();
      reservation.queuePosition = null;
      await queryRunner.manager.save(reservation);

      const remaining = await queryRunner.manager
        .getRepository(Reservation)
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.book_id = :bookId', { bookId: reservation.bookId })
        .andWhere('r.status = :status', { status: ReservationStatus.Active })
        .orderBy('r.created_at', 'ASC')
        .getMany();

      for (let i = 0; i < remaining.length; i += 1) {
        const row = remaining[i]!;
        row.queuePosition = i + 1;
      }
      if (remaining.length > 0) {
        await queryRunner.manager.save(remaining);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
