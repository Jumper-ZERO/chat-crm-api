import { Chat } from "src/modules/chats/entities/chat.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.transfers, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User)
  fromUser: User;

  @ManyToOne(() => User)
  toUser: User;

  @Column({ type: 'timestamp', nullable: true })
  transferredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date
}