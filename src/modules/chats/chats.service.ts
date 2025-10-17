import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
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
    private readonly logger: PinoLogger,
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
    if (!payload.body?.trim()) {
      throw new BadRequestException('Message body cannot be empty');
    }

    const chat = await this.getChatOrFail(chatId)
    const message = this.createMessageEntity(chat, payload)
    const savedMessage = await this.messageRepo.save(message)

    this.updateChatLastMessage(chat.id, savedMessage).catch((error) =>
      this.logger.error('Error updating chat last message', error),
    );

    return savedMessage
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

  async getChats(userID?: string) {
    const chats = await this.chatRepo.find({
      where: userID ? { assignedAgent: { id: userID } } : {},
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

  private async getChatOrFail(chatId: string): Promise<Chat> {
    return this.chatRepo.findOneOrFail({
      where: { id: chatId },
      loadRelationIds: true,
    });
  }

  private determineMessageType(mediaUrl?: string): 'image' | 'text' {
    return mediaUrl ? 'image' : 'text';
  }

  private determineSenderType(direction: 'in' | 'out'): 'client' | 'user' {
    return direction === 'in' ? 'client' : 'user';
  }

  private createMessageEntity(
    chat: Chat,
    payload: Pick<Message, 'senderType' | 'body' | 'mediaUrl' | 'direction' | 'type'>,
  ): Message {
    return this.messageRepo.create({
      chat: { id: chat.id },
      contact: { id: chat.contact?.id },
      agent: { id: chat.assignedAgent?.id },
      senderType: this.determineSenderType(payload.direction),
      direction: payload.direction,
      body: payload.body,
      mediaUrl: payload.mediaUrl,
      type: this.determineMessageType(payload.mediaUrl),
    });
  }

  private async updateChatLastMessage(
    chatId: string,
    message: Message,
  ): Promise<void> {
    try {
      const chat = await this.chatRepo.findOneOrFail({
        where: { id: chatId },
      });
      chat.lastMessage = message;
      await this.chatRepo.save(chat);
    } catch (error) {
      this.logger.warn(
        `Failed to update last message for chat ${chatId}`,
        error,
      );
    }
  }
}
