import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly rooms: Repository<Room>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
  ) {}

  async findByHotel(hotelId: string) {
    return this.rooms.find({
      where: { hotelId, isActive: true },
      order: { pricePerNight: 'ASC' },
    });
  }

  async findOne(id: string) {
    const room = await this.rooms.findOne({
      where: { id },
      relations: ['hotel'],
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(hotelId: string, dto: CreateRoomDto) {
    const room = this.rooms.create({
      ...dto,
      hotelId,
    });
    return this.rooms.save(room);
  }

  async update(id: string, dto: UpdateRoomDto) {
    const room = await this.findOne(id);
    Object.assign(room, dto);
    return this.rooms.save(room);
  }

  async remove(id: string) {
    const room = await this.findOne(id);
    await this.rooms.remove(room);
    return { deleted: true };
  }

  /**
   * Returns rooms available (no overlapping confirmed bookings) in the given date range.
   * Overlap: existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
   */
  async findAvailable(query: AvailabilityQueryDto) {
    const { hotelId, checkIn, checkOut } = query;

    const qb = this.rooms.createQueryBuilder('room').where('room.is_active = true');

    if (hotelId) {
      qb.andWhere('room.hotel_id = :hotelId', { hotelId });
    }

    // Exclude rooms that have overlapping confirmed bookings
    qb.andWhere(
      `room.id NOT IN (
        SELECT b.room_id FROM bookings b
        WHERE b.status = 'confirmed'
          AND b.check_in < :checkOut
          AND b.check_out > :checkIn
      )`,
      { checkIn, checkOut },
    );

    qb.leftJoinAndSelect('room.hotel', 'hotel');
    qb.orderBy('room.price_per_night', 'ASC');

    return qb.getMany();
  }
}
