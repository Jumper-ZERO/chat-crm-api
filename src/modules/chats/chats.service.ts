import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { Chat, Message } from './entities';
import { Contact } from '../contacts/entities/contact.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) { }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'DESC' },
    });
  }

  async addMessage(
    chatId: string,
    payload: Pick<Message, 'senderType' | 'body' | 'mediaUrl' | 'direction' | 'type'>,
  ): Promise<Message> {
    const chat = await this.chatRepo.findOneOrFail({
      where: { id: chatId },
      loadRelationIds: true,
    });

    const message: DeepPartial<Message> = {
      senderType: payload.direction === 'in' ? 'client' : 'user',
      body: payload.body,
      mediaUrl: payload?.mediaUrl,
      type: payload.mediaUrl ? 'image' : 'text',
    };

    const msg = this.messageRepo.create({
      chat: { id: chat.id },
      contact: { id: chat.contact?.id },
      agent: { id: chat.assignedAgent?.id },
      ...message,
    });
    const msgSaved = await this.messageRepo.save(msg);

    if (msgSaved) {
      void this.chatRepo.update({ id: chat.id }, { lastMessage: { id: msgSaved.id } });
    }

    return msgSaved;
  }

  updateLastMessage(chatId: string, messageId: string) {
    return this.chatRepo.update({ id: chatId }, { lastMessage: { id: messageId } });
  }

  async findOrCreateByContact(agentId: string, contactId: string, isSystem: boolean = false): Promise<Chat> {
    let chat = await this.chatRepo.findOne({
      where: { contact: { id: contactId } },
    });

    if (chat) return chat;

    chat = this.chatRepo.create({
      assignedAgent: { id: agentId },
      contact: { id: contactId },
      status: isSystem ? 'pending' : 'open',
    });

    return await this.chatRepo.save(chat);
  }

  async getChats() {
    const chats = await this.chatRepo.find({
      relations: {
        contact: true,
        lastMessage: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 20,
    })

    return chats;
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'DESC' },
    });
  }

  create(dto: CreateChatDto) {
    const chat = this.chatRepo.save(dto);
    return chat;
  }

  findAll() {
    return this.chatRepo.find()
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
