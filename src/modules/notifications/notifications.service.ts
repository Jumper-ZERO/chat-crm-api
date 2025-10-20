import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) { }

  async create(title: string, message?: string) {
    const notification = this.notificationRepo.create({
      title,
      message,
    });
    return this.notificationRepo.save(notification);
  }

  async getAll() {
    return await this.notificationRepo.find({
      where: { read: false },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async markAsRead(id: string) {
    return this.notificationRepo.update(id, { read: true });
  }
}