import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelQueryDto } from './dto/hotel-query.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotels: Repository<Hotel>,
  ) {}

  async findAll(query: HotelQueryDto) {
    const { city, q, page = 1, limit = 10, withDeleted = false } = query;
    const qb = this.hotels.createQueryBuilder('hotel');

    if (withDeleted) {
      qb.withDeleted();
    }

    if (city) {
      qb.andWhere('LOWER(hotel.city) = LOWER(:city)', { city });
    }

    if (q) {
      qb.andWhere('(hotel.name ILIKE :q OR hotel.description ILIKE :q)', { q: `%${q}%` });
    }

    qb.orderBy('hotel.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const hotel = await this.hotels.findOne({
      where: { id },
      relations: ['rooms'],
    });
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async create(dto: CreateHotelDto, userId: string) {
    const hotel = this.hotels.create({
      ...dto,
      managerId: dto.managerId ?? userId,
    });
    return this.hotels.save(hotel);
  }

  async update(id: string, dto: UpdateHotelDto) {
    const hotel = await this.findOne(id);
    Object.assign(hotel, dto);
    return this.hotels.save(hotel);
  }

  async softDelete(id: string) {
    const hotel = await this.findOne(id);
    await this.hotels.softDelete(hotel.id);
    return { deleted: true };
  }
}
