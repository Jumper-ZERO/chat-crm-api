import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageDto, ChatUserDto } from './dto/chat-user.dto';
import { CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { Chat, Message } from './entities';
import { Contact } from '../contacts/entities/contact.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
  ) { }

  async addMessage(
    chatId: string,
    payload: {
      from: string;
      body: string;
      direction: 'incoming' | 'outgoing';
      mediaUrl?: string;
    },
  ): Promise<Message> {
    const chat = await this.chatRepo.findOneOrFail({ where: { id: chatId } });

    const message = this.messageRepo.create({
      chat: chat,
      senderType: payload.direction === 'incoming' ? 'client' : 'user',
      body: payload.body,
      mediaUrl: payload.mediaUrl,
      type: payload.mediaUrl ? 'image' : 'text',
    });

    return this.messageRepo.save(message);
  }

  async findOrCreateByPhone(phoneNumber: string): Promise<Chat> {
    let contact = await this.contactRepo.findOne({
      where: { phoneNumber },
      relations: ['chat'],
    });

    if (!contact) {
      contact = this.contactRepo.create({ phoneNumber });
      await this.contactRepo.save(contact);
    }

    let chat = await this.chatRepo.findOne({
      where: { contact: { id: contact.id }, status: 'open' },
    });

    if (!chat) {
      chat = this.chatRepo.create({
        contact,
        status: 'open',
      });
      await this.chatRepo.save(chat);
    }

    return chat;
  }

  async getChatList(): Promise<ChatUserDto[]> {
    // 1. Cargar Chats con las RELACIONES necesarias
    const chats = await this.chatRepo.find({
      // Carga el 'contact' (para nombre/teléfono) y los 'messages' (para el último mensaje)
      relations: {
        contact: true,
        messages: true,
      },
      // Ordena los mensajes descendente y los chats por fecha de creación descendente
      order: {
        createdAt: 'DESC',
        messages: {
          createdAt: 'DESC',
        }
      },
    });

    // 2. Mapear las entidades de la DB a la DTO del Frontend
    return chats.map(chat => {
      const lastMessage = chat.messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Ordenar por fecha del mensaje (el más nuevo primero)
      [0]; // Tomar el primero

      // Mapear el último mensaje o proporcionar un valor por defecto
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
        title: chat.status === 'open' ? 'Active' : chat.status === 'inProgress' ? 'In Transfer' : 'Closed',

        // Último Mensaje
        lastMessage: mappedLastMessage,
      } as ChatUserDto;
    });
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      order: { sentAt: 'DESC' }, // Ordenar por fecha de envío descendente (los más nuevos primero)
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
