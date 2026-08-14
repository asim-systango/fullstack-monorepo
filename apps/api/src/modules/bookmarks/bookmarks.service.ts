import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { JobsService } from '../jobs/jobs.service';
import { Bookmark } from './bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = (err as { driverError?: { code?: string } }).driverError;
  return driverError?.code === '23505';
}

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarksRepo: Repository<Bookmark>,
    private readonly jobsService: JobsService,
  ) {}

  async create(userId: string, dto: CreateBookmarkDto) {
    // Confirm the job exists (and isn't soft-deleted) before inserting the bookmark.
    await this.jobsService.findOnePublic(dto.jobId);

    const existing = await this.bookmarksRepo.findOne({
      where: { userId, jobId: dto.jobId },
    });
    if (existing) {
      throw new ConflictException('You have already bookmarked this job');
    }

    try {
      const bookmark = this.bookmarksRepo.create({
        userId,
        jobId: dto.jobId,
      });
      return await this.bookmarksRepo.save(bookmark);
    } catch (err) {
      // Race-condition backstop: UNIQUE(user_id, job_id) still holds under concurrent POSTs.
      if (isUniqueViolation(err)) {
        throw new ConflictException('You have already bookmarked this job');
      }
      throw err;
    }
  }

  findMine(userId: string) {
    return this.bookmarksRepo.find({
      where: { userId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeByJobId(userId: string, jobId: string) {
    const bookmark = await this.bookmarksRepo.findOne({ where: { userId, jobId } });
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.bookmarksRepo.remove(bookmark);
    return { ok: true };
  }
}
