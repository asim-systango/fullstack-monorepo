import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { Booking } from '../bookings/booking.entity';
import { HotelsService } from '../hotels/hotels.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly rooms: Repository<Room>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    private readonly hotelsService: HotelsService,
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

  async create(hotelId: string, dto: CreateRoomDto, userId: string, role: string) {
    const hotel = await this.hotelsService.findOne(hotelId);
    if (role !== 'admin' && hotel.managerId !== userId) {
      throw new ForbiddenException('You can only manage rooms for your own hotels');
    }
    const room = this.rooms.create({
      ...dto,
      hotelId,
    });
    return this.rooms.save(room);
  }

  async update(id: string, dto: UpdateRoomDto, userId: string, role: string) {
    const room = await this.findOne(id);
    const hotel = room.hotel;
    if (!hotel) {
      throw new NotFoundException('Hotel not found for this room');
    }
    if (role !== 'admin' && hotel.managerId !== userId) {
      throw new ForbiddenException('You can only manage rooms for your own hotels');
    }
    Object.assign(room, dto);
    return this.rooms.save(room);
  }

  async remove(id: string, userId: string, role: string) {
    const room = await this.findOne(id);
    const hotel = room.hotel;
    if (!hotel) {
      throw new NotFoundException('Hotel not found for this room');
    }
    if (role !== 'admin' && hotel.managerId !== userId) {
      throw new ForbiddenException('You can only manage rooms for your own hotels');
    }
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
        WHERE b.status != 'cancelled'
          AND b.check_in < :checkOut
          AND b.check_out > :checkIn
      )`,
      { checkIn, checkOut },
    );

    qb.innerJoinAndSelect('room.hotel', 'hotel').andWhere('hotel.deleted_at IS NULL');
    qb.orderBy('room.price_per_night', 'ASC');

    return qb.getMany();
  }
}
