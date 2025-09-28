import { Injectable } from '@nestjs/common';
import { CreateChatDto, UpdateChatDto } from './dto/chat.dto';

@Injectable()
export class ChatsService {
  create(_dto: CreateChatDto) {
    return 'This action adds a new chat';
  }

  findAll() {
    return `This action returns all chats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, _dto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
