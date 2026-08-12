import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findAllForUser(userId: string): Promise<Notification[]> {
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
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType | string = NotificationType.SYSTEM,
  ): Promise<Notification> {
    this.logger.log(
      `[SMS_SIMULATOR] Dispatching SMS to User ${userId}: ${title} - ${message}`,
    );

    const notification = this.notificationRepository.create({
      userId,
      title,
      message,
      type,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async sendReminder(appointmentId: string, userId: string): Promise<Notification> {
    const title = 'Upcoming Consultation Reminder';
    const message = `Reminder: You have an upcoming medical consultation scheduled. Please be ready 5 minutes prior to your time window.`;

    return this.createNotification(userId, title, message, NotificationType.REMINDER);
  }
}
