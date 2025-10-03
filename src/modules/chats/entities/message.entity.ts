import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chat } from "./chat.entity";
import { Contact } from "../../contacts/entities/contact.entity";
import { User } from "../../users/entities/user.entity";

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'document';
export type MessageSenderType = 'user' | 'client' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'received' | 'read' | 'failed';
export type MessageDirection = 'in' | 'out';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  waMessageId: string;

  @Column({ nullable: true })
  replyToMessageId: string;

  @Column({ default: 'system' })
  senderType: MessageSenderType;

  @Column({ nullable: true, type: 'text' })
  body: string;

  @Column({ default: 'text' })
  type: MessageType;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ default: 'sent' })
  status: MessageStatus;

  @Column({ default: 'in' })
  direction: MessageDirection;

  @Column('json', { nullable: true })
  reactions: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  @ManyToOne(() => Chat, chat => chat.messages)
  chat: Chat;

  @ManyToOne(() => Contact, contact => contact.messages, { nullable: true })
  contact: Contact;

  @ManyToOne(() => User, { nullable: true })
  agent: User;
}