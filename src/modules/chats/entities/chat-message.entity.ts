import { ChatSession } from "src/modules/chats/entities/chat-session.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatSession, (session) => session.messages)
  session: ChatSession;

  @ManyToOne(() => User, { nullable: true })
  senderType: 'user' | 'client' | 'system';

  @Column('text')
  content: string;

  @Column({ default: 'text' })
  messageType: 'text' | 'image' | 'file';

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}