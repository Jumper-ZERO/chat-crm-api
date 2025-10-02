import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chat } from "./chat.entity";

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  session: Chat;

  @Column({ type: 'enum', enum: ['user', 'client', 'system'], nullable: true })
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

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date
}