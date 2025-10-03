import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateMessageDto } from "../dto/message.dto";
import { Message } from "../entities";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
  ) { }

  async create(dto: CreateMessageDto) {
    const message = this.messageRepo.create({
      ...dto,
      chat: { id: dto.chatId },
      agent: { id: dto.userId },
      contact: { id: dto.contactId },
    });
    return this.messageRepo.save(message);
  }
}