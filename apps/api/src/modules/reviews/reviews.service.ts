import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
  ) {}

  async findByHotel(hotelId: string) {
    return this.reviews.find({
      where: { hotelId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateReviewDto, userId: string) {
    const stay = await this.bookings.findOne({
      where: { userId, status: 'completed', room: { hotelId: dto.hotelId } },
      relations: { room: true },
    });
    if (!stay) {
      throw new ForbiddenException('You can only review after a completed stay');
    }

    const review = this.reviews.create({
      ...dto,
      userId,
    });
    return this.reviews.save(review);
  }

  async findOne(id: string) {
    const review = await this.reviews.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async remove(id: string) {
    const review = await this.findOne(id);
    await this.reviews.remove(review);
    return { deleted: true };
  }

  async getAverageRating(hotelId: string): Promise<number | null> {
    const result = await this.reviews
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.hotelId = :hotelId', { hotelId })
      .getRawOne();
    return result?.avg ? parseFloat(result.avg) : null;
  }
}
