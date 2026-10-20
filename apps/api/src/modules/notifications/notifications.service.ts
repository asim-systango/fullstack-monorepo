import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async createNotification(
    userId: string,
    ticketId: string,
    type: string,
    title: string,
    body?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      ticketId,
      type,
      title,
      body: body ?? null,
      readAt: null,
    });
    return this.notificationRepository.save(notification);
  }
}
