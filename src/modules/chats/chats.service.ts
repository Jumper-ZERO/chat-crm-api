import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ChatMessageDto, ChatUserDto } from './dto/chat-user.dto';
import { CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { CreateMessageDto } from './dto/message.dto';
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

  async addMessage(
    chatId: string,
    payload: CreateMessageDto,
  ): Promise<Message> {
    const chat = await this.chatRepo.findOneOrFail({ where: { id: chatId } });

    const message: DeepPartial<Message> = {
      chat: { id: chat.id },
      senderType: payload.direction === 'in' ? 'client' : 'user',
      body: payload.body,
      mediaUrl: payload?.mediaUrl,
      type: payload.mediaUrl ? 'image' : 'text',
    };

    const msg = this.messageRepo.create(message);

    return this.messageRepo.save(msg);
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

  async getChatList(): Promise<ChatUserDto[]> {
    const chats = await this.chatRepo.find({
      relations: {
        contact: true,
        messages: true,
      },
      order: {
        createdAt: 'DESC',
        messages: {
          createdAt: 'DESC',
        }
      },
    });

    return chats.map(chat => {
      const lastMessage = chat.messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Ordenar por fecha del mensaje (el más nuevo primero)
      [0]; // Tomar el primero

      const mappedLastMessage: ChatMessageDto = lastMessage ? {
        sender: lastMessage.senderType === 'user' ? 'You' : 'Client', // 'client' es el contacto
        content: lastMessage.body,
        timestamp: lastMessage.createdAt,
      } : {
        sender: 'System',
        content: 'No messages yet.',
        timestamp: new Date()
      };

      return {
        id: chat.id,
        // Mapeo de datos del Contacto (Contact)
        fullName: chat.contact?.name || chat.contact?.phoneNumber || `Chat #${chat.id}`,
        phone: chat.contact?.phoneNumber || 'N/A',
        avatar: chat.contact.profile, // Usar un valor por defecto o cargar el real si existe

        // Mapeo de datos del Chat
        status: chat.status,
        title: chat.status === 'open' ? 'Active' : chat.status === 'pending' ? 'Pending' : 'Closed',

        // Último Mensaje
        lastMessage: mappedLastMessage,
      } as ChatUserDto;
    });
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'DESC' }, // Ordenar por fecha de envío descendente (los más nuevos primero)
      // relations: ['senderType'], // Si 'senderType' sigue siendo una relación a User
    });
  }

  create(_dto: CreateChatDto) {
    return 'This action adds a new chat';
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
