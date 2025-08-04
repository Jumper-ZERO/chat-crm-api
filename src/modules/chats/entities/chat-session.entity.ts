import { ChatMessage } from "src/modules/chats/entities/chat-message.entity";
import { ChatTransfer } from "src/modules/chats/entities/chat-transfer.entity";
import { Client } from "src/modules/clients/entities/client.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, (client) => client.chatSessions)
  client: Client;

  @ManyToOne(() => User, { nullable: true })
  assignedUser: User;

  @Column({ default: 'open' })
  status: 'open' | 'closed' | 'transferred' | 'pending';

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date;

  @OneToMany(() => ChatMessage, (msg) => msg.session)
  messages: ChatMessage[];

  @OneToMany(() => ChatTransfer, (t) => t.session)
  transfers: ChatTransfer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}