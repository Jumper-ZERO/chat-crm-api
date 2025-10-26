import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
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
    return await this.notificationRepo.save(notification);
  }

  async getAll() {
    return await this.notificationRepo.find({
      order: { createdAt: 'DESC', read: 'ASC' },
      take: 5,
    });
  }

  async markAsRead(ids: string[]) {
    return await this.notificationRepo.update({ id: In(ids) }, { read: true });
  }
}