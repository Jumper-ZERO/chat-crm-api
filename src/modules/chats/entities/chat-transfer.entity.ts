import { ChatSession } from "src/modules/chats/entities/chat-session.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('chat_transfers')
export class ChatTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatSession, (session) => session.transfers, { onDelete: 'CASCADE' })
  session: ChatSession;

  @ManyToOne(() => User)
  fromUser: User;

  @ManyToOne(() => User)
  toUser: User;

  @Column({ type: 'timestamp', nullable: true })
  transferredAt: Date;
}